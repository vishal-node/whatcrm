const production = {
    ...process.env,
    NODE_ENV: process.env.NODE_ENV || 'production',
};

const development = {
    ...process.env,
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: '9000',
    Meta_WA_accessToken:'EAAJuWYqVosQBALUrJrhM2GpIIIToikrfFmoIHDZBMZCr7BOto8jGVcPEKqMt0zZC28KZAh4xWnBQS9CzLF5MR3RucBWD5absuS8cVbbWeYRMrRT2pHPWwiB7Uc0Tx99UOlDfZB2cOqPSgphW5MBAVPO3CRHqpoZCpskPfWlgMQCtJNv7ljvYwAv82KSqwNzUMVpqRpxGlkUAZDZD',
    Meta_WA_SenderPhoneNumberId: '105167829072955',
    Meta_WA_wabaId: '684280809628356',
    Meta_WA_VerifyToken: 'YouCanSetYourOwnToken',
};

const fallback = {
    ...process.env,
    NODE_ENV: undefined,
};

module.exports = (environment) => {
    console.log(`Execution environment selected is: "${environment}"`);
    if (environment === 'production') {
        return production;
    } else if (environment === 'development') {
        return development;
    } else {
        return fallback;
    }
};