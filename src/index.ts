import showdown from 'showdown';
import express from 'express';
import fs from 'fs/promises';
import path from 'path';

const MARKDOWN_PARENT_PATH = './build/static/markdown';

type ExpressFunction = (
  req: express.Request,
  res: express.Response,
) => Promise<void>;

async function convertFromMarkdown(filePath: string) {
  const converter = new showdown.Converter({ metadata: true });
  const text = (await fs.readFile(filePath)).toString();
  const htmlBody = converter.makeHtml(text);
  const meta = converter.getMetadata() as showdown.Metadata;
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>viveknathani - ${meta['title']}</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <meta charset="utf-8">
      <link rel="stylesheet" type="text/css" href="/static/theme.css">
    </head>
    <body>
    ${htmlBody}
    </body>
    </html>
  `;
}

function serve(
  source: string,
  type: 'AS_FILE' | 'AS_MARKDOWN_STRING' | 'AS_SLUG',
): ExpressFunction {
  return async (req: express.Request, res: express.Response) => {
    try {
      if (type === 'AS_FILE') {
        res.sendFile(path.resolve(__dirname, source));
        return;
      }
      if (type === 'AS_SLUG') {
        source = `${source}/${req.params['slug']}.md`;
      }
      const html = await convertFromMarkdown(source);
      res.send(html);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: '' });
    }
  };
}

async function main() {
  const app = express();
  const port = process.env.PORT || 3000;
  app.use('/static', express.static(path.join(__dirname, './static')));
  app.get('/', serve('./static/index.html', 'AS_FILE'));
  app.get(
    '/lists',
    serve(`${MARKDOWN_PARENT_PATH}/lists.md`, 'AS_MARKDOWN_STRING'),
  );
  app.get(
    '/blog',
    serve(`${MARKDOWN_PARENT_PATH}/blog/index.md`, 'AS_MARKDOWN_STRING'),
  );
  app.get(
    '/notes',
    serve(`${MARKDOWN_PARENT_PATH}/notes/index.md`, 'AS_MARKDOWN_STRING'),
  );
  app.get('/blog/:slug', serve(`${MARKDOWN_PARENT_PATH}/blog`, 'AS_SLUG'));
  app.get('/notes/:slug', serve(`${MARKDOWN_PARENT_PATH}/notes`, 'AS_SLUG'));
  app.get('*', serve('./static/404.html', 'AS_FILE'));
  app.listen(port, () => {
    console.log('⚡️ server is up and running!');
  });
}

main();