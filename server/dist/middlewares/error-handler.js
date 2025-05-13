import { makeError } from "../utils/error";
export async function errorHandlerMiddleware(err, c) {
    const result = makeError(err);
    if (!result) {
        throw new Error('Error handler failed to process error');
    }
    const { error, statusCode } = result;
    console.error(error.message, error);
    return c.json(error, { status: statusCode });
}
