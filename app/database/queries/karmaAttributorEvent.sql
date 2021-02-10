CREATE EVENT IF NOT EXISTS karma_attributor_event
ON SCHEDULE EVERY 1 MINUTE # Set every X SECOND|MINUTE|HOUR will the event be executed 
STARTS NOW() # Sets when the event will start the first time
# For test, instant first execution : NOW()
# For prod, which calculates the date corresponding to the nearest next hour : (DATE_ADD(NOW(), INTERVAL (3600 - UNIX_TIMESTAMP(NOW()) % 3600) SECOND))
ON COMPLETION PRESERVE # The event will be repeated endlessly
DO
  BEGIN
    # General variables
    DECLARE v_start_search_date DATETIME;
    DECLARE v_end_search_date DATETIME;
    DECLARE v_real_start_date DATETIME;
    DECLARE v_real_end_date DATETIME;
    DECLARE v_history_voting_id INT;
    DECLARE v_count_user_updated INT DEFAULT 0;
    DECLARE v_total_karma_changed INT DEFAULT 0;

    # Per user variables
    DECLARE v_user_id INT DEFAULT 0;
    DECLARE v_total_post_karma_changed INT DEFAULT 0;
    DECLARE v_total_comment_karma_changed INT DEFAULT 0;

    # Cursor to select every user that has to be updated
    DECLARE v_finished INTEGER DEFAULT 0;
	DECLARE c_users CURSOR FOR 
	    SELECT user_fk 
        FROM history_post_vote
        WHERE history_voting_fk = v_history_voting_id
        UNION DISTINCT
        SELECT user_fk
        FROM history_comment_vote
        WHERE history_voting_fk = v_history_voting_id;

    # This will catch any error made during the transaction bellow and rollbacks everything (+ logs the error)
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        GET DIAGNOSTICS CONDITION 1
        @p1 = RETURNED_SQLSTATE, @p2 = MESSAGE_TEXT;
        ROLLBACK;
        INSERT INTO log(name, type, message) SELECT 'karma_attributor_event', 'C', Concat(@p1, ' : ', @p2);
    END;
    # This will only catch the error when no value is found during the cursor execution
	DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_finished = 1;

    # This will allow everything bellow to not auto-commit until the COMMIT; line
    START TRANSACTION;

    # Saves the current date for performance purpose
    SET v_real_start_date = NOW();

    # Creates a new voting record with the start_searching_date at the last end_search_date executed + 1 second
    INSERT INTO history_voting(start_search_date, end_search_date) 
    SELECT COALESCE(DATE_ADD(MAX(end_search_date), INTERVAL 1 SECOND), STR_TO_DATE('01/01/2000', '%d/%m/%Y')), NOW() 
    FROM history_voting
    WHERE rollbacked = 0
    LIMIT 1;
    
    # Retrieves the created history_voting
    SELECT history_voting_id, start_search_date, end_search_date
    INTO v_history_voting_id, v_start_search_date, v_end_search_date
    FROM history_voting 
    WHERE history_voting_id = LAST_INSERT_ID();

    INSERT INTO log(name, type, message) SELECT 'karma_attributor_event', 'D', Concat('Last id : ', LAST_INSERT_ID(), ', infos : ', v_start_search_date, ', ', v_end_search_date);

    # Get all the post votes inserted/updated between the search dates
    INSERT INTO history_post_vote (history_voting_fk, post_fk, user_fk, upvote, downvote, score)
    SELECT v_history_voting_id, post_fk, post.user_fk, upvote, downvote, If(upvote=true, 1, IF(downvote=true, -1, 0))
    FROM post_vote
    INNER JOIN post ON (post_id = post_fk)
    WHERE COALESCE(updated_at, created_at) BETWEEN v_start_search_date AND v_end_search_date;

    INSERT INTO log(name, type, message) SELECT 'karma_attributor_event', 'D', Concat(ROW_COUNT(), ' history_post_vote rows inserted');
    
    # Gets all the comment votes inserted/updated between the search dates
    INSERT INTO history_comment_vote (history_voting_fk, comment_fk, user_fk, upvote, downvote, score)
    SELECT v_history_voting_id, comment_fk, comment.user_fk, upvote, downvote, If(upvote=true, 1, IF(downvote=true, -1, 0))
    FROM comment_vote
    INNER JOIN comment ON (comment_id = comment_fk)
    WHERE COALESCE(updated_at, created_at) BETWEEN v_start_search_date AND v_end_search_date;

    INSERT INTO log(name, type, message) SELECT 'karma_attributor_event', 'D', Concat(ROW_COUNT(), ' history_comment_vote rows inserted');

    # Opening cursor
	OPEN c_users;
	l_users: LOOP
		FETCH c_users INTO v_user_id;
		IF v_finished = 1 OR v_user_id = 0 THEN 
			LEAVE l_users;
		END IF;

        # Reset per user variables
        SET v_total_post_karma_changed = 0;
        SET v_total_comment_karma_changed = 0;

        # Set global variables
        SET v_count_user_updated = v_count_user_updated + 1;

        # Select total karma changed from posts
        SELECT IFNULL(Sum(new_hpv.score-IFNULL(old_hpv.score,0)),0)
        INTO v_total_post_karma_changed
        FROM history_post_vote AS new_hpv
        LEFT JOIN history_post_vote AS old_hpv ON (old_hpv.post_fk = new_hpv.post_fk AND old_hpv.user_fk = new_hpv.user_fk AND old_hpv.is_last_value = 1 AND old_hpv.rollbacked = 0)
        WHERE new_hpv.history_voting_fk = v_history_voting_id
        AND new_hpv.user_fk = v_user_id;

        # Select total karma changed from comments
        SELECT IFNULL(Sum(new_hcv.score-IFNULL(old_hcv.score,0)),0)
        INTO v_total_comment_karma_changed
        FROM history_comment_vote AS new_hcv
        LEFT JOIN history_comment_vote AS old_hcv ON (old_hcv.comment_fk = new_hcv.comment_fk AND old_hcv.user_fk = new_hcv.user_fk AND old_hcv.is_last_value = 1 AND old_hcv.rollbacked = 0)
        WHERE new_hcv.history_voting_fk = v_history_voting_id
        AND new_hcv.user_fk = v_user_id;

        # Set total karma changed
        SET v_total_karma_changed = IFNULL(v_total_karma_changed,0) + v_total_post_karma_changed + v_total_comment_karma_changed;

		# Update user karma
		UPDATE user_stats
        SET karma = IFNULL(karma,0) + v_total_post_karma_changed + v_total_comment_karma_changed
        WHERE user_stats.user_fk = v_user_id;
	END LOOP l_users;
	CLOSE c_users;

    # Updates last value to false for the history_post_vote that are no longer the lastest values
    UPDATE history_post_vote AS old_hpv
    JOIN history_post_vote AS new_hpv ON (new_hpv.post_fk = old_hpv.post_fk AND new_hpv.user_fk = old_hpv.user_fk)
    SET old_hpv.is_last_value = 0
    WHERE old_hpv.is_last_value = 1
    AND new_hpv.history_voting_fk = v_history_voting_id;

    # Updates last value to true for the history_post_vote that are now the real latest values
    UPDATE history_post_vote
    SET is_last_value = 1
    WHERE history_voting_fk = v_history_voting_id;

    # Updates last value to false for the history_comment_vote that are no longer the lastest values
    UPDATE history_comment_vote AS old_hcv
    JOIN history_comment_vote AS new_hcv ON (new_hcv.comment_fk = old_hcv.comment_fk AND new_hcv.user_fk = old_hcv.user_fk)
    SET old_hcv.is_last_value = 0
    WHERE old_hcv.is_last_value = 1
    AND new_hcv.history_voting_fk = v_history_voting_id;

    # Updates last value to true for the history_comment_vote that are now the real latest values
    UPDATE history_comment_vote
    SET is_last_value = 1
    WHERE history_voting_fk = v_history_voting_id;
    
    # Saves the current date for performance purpose
    SET v_real_end_date = NOW();

    # Sets the real dates and other stats
    UPDATE history_voting
    SET real_start_date = v_real_start_date, real_end_date = v_real_end_date, updated_user_count = v_count_user_updated, total_karma_changed = v_total_karma_changed
    WHERE history_voting_id = v_history_voting_id;

    INSERT INTO log(name, type, message) SELECT 'karma_attributor_event', 'I', 'Executed successfully';

    # Commits all changes, only done if no errors has been raised during the transaction
    COMMIT;
  END