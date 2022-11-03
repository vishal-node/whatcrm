const production = {
    ...process.env,
    NODE_ENV: process.env.NODE_ENV || 'production',
};

const development = {
    ...process.env,
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: '9000',
    Meta_WA_accessToken:'EAAJuWYqVosQBAGQ7OLGmKkZAK4DaDis3XnsL1esVCXwSZAmHMOm4Teq4czB0oZBwtHtDaZBUE97AUqIseTWUhRsgZBsHjdScDfeiRifIVEDbxz4PuoJP1NKUGjBNJL4ZC4AUCw88bOZAwyZCl27rw6iQYZCzZBVil1cv84LsLgtnli0ROuBVVCPbn8NLWmHrmUOlfOfogSkqhN9gZDZD',
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