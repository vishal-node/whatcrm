const production = {
    ...process.env,
    NODE_ENV: process.env.NODE_ENV || 'production',
};

const development = {
    ...process.env,
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: '9000',
    Meta_WA_accessToken:'EAAJuWYqVosQBADZB38OZCH7fuzYZCTEfDirhkgKXaeoF057R1WrCUXpHZBxPZAvGM3013vOZCe3axkAKha40yE7unV9aObVm7Gn5EEZA4CZBRd3XYDaJRZAQ7RhCYyt7FCz2OB6VnIZBh07Si6uhh7U5XNgcPp7tYDz9w1nrnaKA1sCOb3uLso3ZCfSzZCbIIavuZBP3FVfYBhiqNzQZDZD',
    Meta_WA_SenderPhoneNumberId: '105167829072955',
    Meta_WA_wabaId: '112486854996660',
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