// I don't know where to put this documentation
/** @swagger
 * tags:
 * - name: Provenances
 *   description: Get filtered lists of posts
 * - name: Posts
 *   description: Get or create posts
 * - name: Comments
 *   description: Get or create comments
 * - name: Votes
 *   description: Make or edit comments
 * - name: Users
 *   description: Register, log in or out
 * - name: Debug
 *   description: Operations for testing
 *
 * components:
 *   schemas:
 *     api_response:
 *        type: object
 *        properties:
 *          success:
 *            type: boolean
 *          message:
 *            type: string
 *
 *   securitySchemes:
 *     cookieAuth:
 *        type: apiKey
 *        in: cookie
 *        name: token
 *        description: Some operations are only available for authenticated users.
 */
