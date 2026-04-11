import { defineConfig } from 'tinacms';

const branch =
  process.env.GITHUB_BRANCH ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  process.env.HEAD ||
  'main';

export default defineConfig({
  branch,
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID || '',
  token: process.env.TINA_TOKEN || '',

  build: {
    outputFolder: 'admin',
    publicFolder: 'public',
  },
  media: {
    tina: {
      mediaRoot: 'uploads',
      publicFolder: 'public',
    },
  },
  schema: {
    collections: [
      {
        name: 'post',
        label: 'Blog Posts',
        path: 'content/blog',
        format: 'mdx',
        fields: [
          {
            type: 'string',
            name: 'title',
            label: 'Title',
            isTitle: true,
            required: true,
          },
          {
            type: 'string',
            name: 'slug',
            label: 'Slug',
            required: true,
          },
          {
            type: 'string',
            name: 'excerpt',
            label: 'Excerpt',
            ui: {
              component: 'textarea',
            },
          },
          {
            type: 'image',
            name: 'coverImage',
            label: 'Cover Image',
          },
          {
            type: 'string',
            name: 'categories',
            label: 'Categories',
            list: true,
            options: [
              { value: 'ai', label: 'AI' },
              { value: 'infrastructure', label: 'Infrastructure' },
              { value: 'product', label: 'Product' },
              { value: 'career', label: 'Career' },
              { value: 'tutorial', label: 'Tutorial' },
            ],
          },
          {
            type: 'datetime',
            name: 'publishedAt',
            label: 'Published At',
          },
          {
            type: 'rich-text',
            name: 'body',
            label: 'Body',
            isBody: true,
          },
        ],
        ui: {
          router: ({ document }) => {
            return `/blog/${document._sys.filename}`;
          },
        },
      },
      {
        name: 'changelog',
        label: 'Changelog',
        path: 'content/changelog',
        format: 'mdx',
        fields: [
          {
            type: 'datetime',
            name: 'date',
            label: 'Date',
            required: true,
          },
          {
            type: 'string',
            name: 'title',
            label: 'Title',
            isTitle: true,
            required: true,
          },
          {
            type: 'string',
            name: 'summary',
            label: 'Summary',
            ui: {
              component: 'textarea',
            },
          },
          {
            type: 'string',
            name: 'categories',
            label: 'Categories',
            list: true,
            options: [
              { value: 'feat', label: 'Feature' },
              { value: 'fix', label: 'Fix' },
              { value: 'infra', label: 'Infrastructure' },
              { value: 'content', label: 'Content' },
              { value: 'meta', label: 'Meta' },
            ],
          },
          {
            type: 'boolean',
            name: 'published',
            label: 'Published',
          },
          {
            type: 'rich-text',
            name: 'body',
            label: 'Body',
            isBody: true,
          },
        ],
        ui: {
          router: () => '/changelog',
        },
      },
    ],
  },
});
