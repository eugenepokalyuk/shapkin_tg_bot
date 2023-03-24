const TelegramBot = require('node-telegram-bot-api');
const sqlite3 = require('sqlite3').verbose();

const TOKEN = '5934121092:AAEmFla6FYWE_gJ_nvuSa7wyOJpZ1248LgA';
const db = new sqlite3.Database('hat.db');

const mainMenu = {
    reply_markup: {
        keyboard: [
            [{ text: 'Каталог' }, { text: 'Доставка' }],
            [{ text: 'Обратная связь' }, { text: 'Мои заказы' }],
        ],
        resize_keyboard: true,
    },
};

const catalogMenu = {
    reply_markup: {
        keyboard: [
            [{ text: 'Зима' }, { text: 'Весна/Осень' }],
            [{ text: 'Лето' }, { text: 'Назад' }],
        ],
        resize_keyboard: true,
    },
};

const backMenu = {
    reply_markup: {
        keyboard: [
            [{ text: 'Назад' }],
        ],
        resize_keyboard: true,
    },
};

const getHat = (chatId, season) => {
    db.get(`SELECT * FROM hats WHERE season = ?`, [season], (err, row) => {
        if (err) throw err;
        if (!row) {
            bot.sendMessage(chatId, 'Нет товаров для этого времени года.');
            return;
        }
        const { id, name, image_url, color, size, price } = row;
        const message = `
            <b>${name}</b>\n\n
            <a href="${image_url}">&#8205;</a>\n\n
            <b>${season}</b>\n\n
            Цвет: ${color}\n
            Размер: ${size}\n
            Цена: ${price} руб.\n
        `;
        const options = {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '<', callback_data: `prev_${id}` },
                        { text: '1 / 1', callback_data: `pages_${id}_1_1` },
                        { text: '>', callback_data: `next_${id}` },
                    ],
                    [{ text: 'Положить в корзину', callback_data: `buy_${id}` }],
                    [{ text: 'Назад', callback_data: 'back' }],
                ],
            },
            parse_mode: 'HTML',
        };
        bot.sendMessage(chatId, message, options);
    });
};

const bot = new TelegramBot(TOKEN, { polling: true });

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (text === '/start') {
        bot.sendMessage(chatId, 'Привет! Я бот для продажи шапок. Что вы хотели бы сделать?', mainMenu);
    } else if (text === 'Каталог') {
        bot.sendMessage(chatId, 'Выберите время года:', catalogMenu);
    } else if (text === 'Зима') {
        getHat(chatId, 'Зима');
    } else if (text === 'Весна/Осень') {
        getHat(chatId, 'Весна/Осень');
    } else if (text === 'Лето') {
        getHat(chatId, 'Лето');
    } else if (text === 'Назад') {
        bot.sendMessage(chatId, 'Что вы хотели бы сделать?', mainMenu);
    } else if (text === 'Доставка') {
        bot.sendMessage(chatId, 'Введите адрес доставки:', backMenu);
    } else if (text === 'Обратная связь') {
        bot.sendMessage(chatId, 'Введите свой вопрос или комментарий:', backMenu);
    } else if (text === 'Мои заказы') {
        bot.sendMessage(chatId, 'У вас пока нет заказов.', backMenu);
    } else {
        bot.sendMessage(chatId, 'Я не понимаю, что вы хотите сделать. Выберите пункт меню.', mainMenu);
    }
});

// bot.on('callback_query', (query) => {
// const chatId = query.message.chat.id;
// const messageId = query.message.message_id;
// const data = query.data.split('_');
// const action = data[0];
// const hatId = data[1];
// if (action === 'prev') {
//     // Обработчик для перехода к предыдущей странице
// } else if (action === 'next') {
//     // Обработчик для перехода к следующей странице
// } else if (action === 'buy') {
//     // Обработчик для добавления товара в корзину
// } else if (action === 'back') {
//     bot.editMessageText('Что вы хотели бы сделать?', { chat_id: chatId, message_id: messageId, reply_markup: mainMenu });
// }
// });

bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;
    const data = query.data.split('_');
    const action = data[0];
    const hatId = data[1];
    if (action === 'prev') {
        const currentHatIndex = currentHats.findIndex((hat) => hat.id === hatId);
        const prevHat = currentHats[currentHatIndex - 1];
        if (prevHat) {
            const prevHatId = prevHat.id;
            const prevHatDesc = `Время года: ${prevHat.season}\nЦвет: ${prevHat.color}\nРазмер: ${prevHat.size}`;
            bot.editMessageMedia(
                {
                    type: 'photo',
                    media: { source: prevHat.imageUrl },
                },
                {
                    chat_id: chatId,
                    message_id: messageId,
                    reply_markup: {
                        inline_keyboard: [
                            [
                                { text: '←', callback_data: `prev_${prevHatId}` },
                                { text: `${currentHatIndex + 1}/${currentHats.length}`, callback_data: 'noop' },
                                { text: '→', callback_data: `next_${prevHatId}` },
                            ],
                            [{ text: prevHat.season, callback_data: 'noop' }],
                            [{ text: prevHatDesc, callback_data: 'noop' }],
                            [{ text: 'Добавить в корзину', callback_data: `buy_${prevHatId}` }],
                            [{ text: 'Назад', callback_data: 'back' }],
                        ],
                    },
                }
            );
        }
    } else if (action === 'next') {
        const currentHatIndex = currentHats.findIndex((hat) => hat.id === hatId);
        const nextHat = currentHats[currentHatIndex + 1];
        if (nextHat) {
            const nextHatId = nextHat.id;
            const nextHatDesc = `Время года: ${nextHat.season}\nЦвет: ${nextHat.color}\nРазмер: ${nextHat.size}`;
            bot.editMessageMedia(
                {
                    type: 'photo',
                    media: { source: nextHat.imageUrl },
                },
                {
                    chat_id: chatId,
                    message_id: messageId,
                    reply_markup: {
                        inline_keyboard: [
                            [
                                { text: '←', callback_data: `prev_${nextHatId}` },
                                { text: `${currentHatIndex + 2}/${currentHats.length}`, callback_data: 'noop' },
                                { text: '→', callback_data: `next_${nextHatId}` },
                            ],
                            [{ text: nextHat.season, callback_data: 'noop' }],
                            [{ text: nextHatDesc, callback_data: 'noop' }],
                            [{ text: 'Добавить в корзину', callback_data: `buy_${nextHatId}` }],
                            [{ text: 'Назад', callback_data: 'back' }],
                        ],
                    },
                }
            );
        }
    } else if (action === 'buy') {
        const hat = hats.find((hat) => hat.id === hatId);
        cart.push(hat);
        bot.answerCallbackQuery(query.id, { text: `Товар "${hat.name}" добавлен в корзину` });
    } else if (action === 'back') {
        bot.editMessageText('Что вы хотели бы сделать?', { chat_id: chatId, message_id: messageId, reply_markup: mainMenu });
    }
});


db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS hats ( id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, image_url TEXT NOT NULL, season TEXT NOT NULL, color TEXT NOT NULL, size TEXT NOT NULL, price INTEGER NOT NULL )`);
    // Добавьте здесь свои товары в базу данных
    db.run(`
    INSERT INTO hats (name, image_url, season, color, size, price)
    VALUES ('Шапка зимняя', 'https://example.com/winter-hat.jpg', 'Зима', 'Черный', 'M', 1000)
`);
});

console.log('Бот запущен!');