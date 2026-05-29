export const handleAndThrowError = (result: any) => {
    let errorMsg = ``;
    result.errors.forEach((err: any) => {
        errorMsg += `${err.message}\n`;
    });
    throw new Error(`${errorMsg}`);
}