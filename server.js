const Sequelize = require('sequelize');
const client = new Sequelize('postgres://localhost/bookmarks');
const express = require('express');

const app = express();

const PORT = process.env.PORT || 3000;

const Bookmark = client.define('bookmark', {
	name: {
		type: Sequelize.STRING,
	},
	url: {
		type: Sequelize.STRING,
	},
});

const Category = client.define('category', {
	name: {
		type: Sequelize.STRING,
	},
});

Bookmark.belongsTo(Category);

app.get('/', async (req, res, next) => {
	try {
		const bookmarks = await Bookmark.findAll({
			include: [Category],
		});
		res.send(`
                <html>
                    <head>
                        <title>Bookmarker</title>
                    </head>
                    <body>
                        <h1>Bookmarker</h1>
                        <div>
                            <ul>
                                ${bookmarks.map((item) => {
																	`<li>${item.name}</li>`;
																})}
                            </ul>
                        </div>
                    </body>
                </html>
        `);
	} catch (ex) {
		next(ex);
	}
});

const init = async (req, res) => {
	try {
		await client.sync({ force: true });
		const [coding, search, jobs] = await Promise.all([
			Category.create({ name: 'coding' }),
			Category.create({ name: 'search' }),
			Category.create({ name: 'jobs' }),
		]);
		const [google, stackoverflow, bing] = await Promise.all([
			Bookmark.create({
				name: 'Google',
				url: 'www.google.com/',
				categoryId: search.id,
			}),
			Bookmark.create({
				name: 'Stack Overflow',
				url: 'stackoverflow.com/',
				categoryId: coding.id,
			}),
			Bookmark.create({
				name: 'Bing',
				url: 'www.bing.com/',
				categoryId: search.id,
			}),
			Bookmark.create({
				name: 'LinkedIn',
				url: 'www.linkedin.com/',
				categoryId: jobs.id,
			}),
		]);
		app.listen(PORT, () => {
			console.log(`Listening in on port ${PORT}`);
		});
	} catch (ex) {
		console.log(ex);
	}
};
init();
