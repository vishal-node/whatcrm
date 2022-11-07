'use strict';
const router = require('express').Router();

const WhatsappCloudAPI = require('whatsappcloudapi_wrapper');
const Whatsapp = new WhatsappCloudAPI({
    accessToken: process.env.Meta_WA_accessToken,
    senderPhoneNumberId: process.env.Meta_WA_SenderPhoneNumberId,
    WABA_ID: process.env.Meta_WA_wabaId, 
    graphAPIVersion: 'v14.0'
});

router.get('/',(req,res)=>{
    res.send("hello");
});

const EcommerceStore = require('./../utils/ecommerce_store.js');
let Store = new EcommerceStore();
const CustomerSession = new Map();

router.get('/meta_wa_callbackurl', (req, res) => {
    try {
        console.log('GET: Someone is pinging me!' + process.env.Meta_WA_VerifyToken);

        let mode = req.query['hub.mode'];
        let token = req.query['hub.verify_token'];
        let challenge = req.query['hub.challenge'];
        const tk = "YouCanSetYourOwnToken";

        if (
            mode &&
            token &&
            mode === 'subscribe' &&
            tk === token
        ) {
            return res.status(200).send(challenge);
        } else {
            return res.sendStatus(403);
        }
    } catch (error) {
        console.error({error})
        return res.sendStatus(500);
    }
});

router.post('/meta_wa_callbackurl', async (req, res) => {
    try {
        let data = Whatsapp.parseMessage(req.body);

        if (data?.isMessage) {
            let incomingMessage = data.message;
            let recipientPhone = incomingMessage.from.phone; // extract the phone number of sender
            let recipientName = incomingMessage.from.name;
            let typeOfMsg = incomingMessage.type; // extract the type of message (some are text, others are images, others are responses to buttons etc...)
            let message_id = incomingMessage.message_id; // extract the message id

            if (typeOfMsg && typeOfMsg === 'text_message') {
                await Whatsapp.sendSimpleButtons({
                    message: `Hey ${recipientName}, \nYou are speaking to a chatbot.\nWhat do you want to do next?`,
                    recipientPhone: recipientPhone, 
                    listOfButtons: [
                        {
                            title: 'View some products',
                            id: 'see_categories',
                        },
                        {
                            title: 'Speak to a human',
                            id: 'speak_to_human',
                        },
                    ],
                });
            }

            if (typeOfMsg && typeOfMsg === 'simple_button_message') {
                let button_id = incomingMessage.button_reply.id;
            
                if (button_id === 'speak_to_human') {
                    await Whatsapp.sendText({
                        recipientPhone: recipientPhone,
                        message: `Arguably, chatbots are faster than humans.\nCall my human with the below details:`,
                    });
            
                    await Whatsapp.sendContact({
                        recipientPhone: recipientPhone,
                        contact_profile: {
                            addresses: [
                                {
                                    city: 'Nairobi',
                                    country: 'Kenya',
                                },
                            ],
                            name: {
                                first_name: 'Daggie',
                                last_name: 'Blanqx',
                            },
                            org: {
                                company: 'Mom-N-Pop Shop',
                            },
                            phones: [
                                {
                                    phone: '+1 (555) 025-3483',
                                },
                                                    {
                                    phone: '+254712345678',
                                },
                            ],
                        },
                    });
                }
                if (button_id === 'see_categories') {
                    let categories = await Store.getAllCategories(); 
                    await Whatsapp.sendSimpleButtons({
                        message: `We have several categories.\nChoose one of them.`,
                        recipientPhone: recipientPhone, 
                        listOfButtons: categories.data
                            .map((category) => ({
                                title: category,
                                id: `category_${category}`,
                            }))
                            .slice(0, 3)
                    });
                }
                if (button_id.startsWith('category_')) {
                    let selectedCategory = button_id.split('category_')[1];
                    let listOfProducts = await Store.getProductsInCategory(selectedCategory);
                
                    let listOfSections = [
                        {
                            title: `🏆 Top 3: ${selectedCategory}`.substring(0,24),
                            rows: listOfProducts.data
                                .map((product) => {
                                    let id = `product_${product.id}`.substring(0,256);
                                    let title = product.title.substring(0,21);
                                    let description = `${product.price}\n${product.description}`.substring(0,68);
                                   
                                    return {
                                        id,
                                        title: `${title}...`,
                                        description: `$${description}...`
                                    };
                                }).slice(0, 10)
                        },
                    ];
                
                    await Whatsapp.sendRadioButtons({
                        recipientPhone: recipientPhone,
                        headerText: `#BlackFriday Offers: ${selectedCategory}`,
                        bodyText: `Our Santa 🎅🏿 has lined up some great products for you based on your previous shopping history.\n\nPlease select one of the products below:`,
                        footerText: 'Powered by: BMI LLC',
                        listOfSections,
                    });
                }
            };

            if (typeOfMsg === 'radio_button_message') {
                let selectionId = incomingMessage.list_reply.id; // the customer clicked and submitted a radio button

                if (selectionId.startsWith('product_')) {
                    let product_id = selectionId.split('_')[1];
                    let product = await Store.getProductById(product_id);
                    const { price, title, description, category, image: imageUrl, rating } = product.data;
                
                    let emojiRating = (rvalue) => {
                        rvalue = Math.floor(rvalue || 0); // generate as many star emojis as whole number ratings
                        let output = [];
                        for (var i = 0; i < rvalue; i++) output.push('⭐');
                        return output.length ? output.join('') : 'N/A';
                    };
                
                    let text = `_Title_: *${title.trim()}*\n\n\n`;
                    text += `_Description_: ${description.trim()}\n\n\n`;
                    text += `_Price_: $${price}\n`;
                    text += `_Category_: ${category}\n`;
                    text += `${rating?.count || 0} shoppers liked this product.\n`;
                    text += `_Rated_: ${emojiRating(rating?.rate)}\n`;
                
                    await Whatsapp.sendImage({
                        recipientPhone,
                        url: imageUrl,
                        caption: text,
                    });
                
                    await Whatsapp.sendSimpleButtons({
                        message: `Here is the product, what do you want to do next?`,
                        recipientPhone: recipientPhone, 
                        listOfButtons: [
                            {
                                title: 'Add to cart🛒',
                                id: `add_to_cart_${product_id}`,
                            },
                            {
                                title: 'Speak to a human',
                                id: 'speak_to_human',
                            },
                            {
                                title: 'See more products',
                                id: 'see_categories',
                            },
                        ],
                    });
                }
                
            }
        }
        
        console.log('POST: Someone is pinging me!');
        return res.sendStatus(200);
    } catch (error) {
                console.error({error})
        return res.sendStatus(500);
    }
});
module.exports = router;