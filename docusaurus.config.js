// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Mcjty Wiki',
  tagline: 'The Official McJty Wiki!',
  url: 'https://mcjty.tomheaton.dev',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        // TODO: add mods and tutorials as docs
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl:
            'https://github.com/tomheaton/mcjty-website/tree/main/',
        },
        blog: false, /*{
          showReadingTime: true,
          editUrl:
            'https://github.com/tomheaton/mcjty-website/tree/main/',
        },*/
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'McJty Wiki',
        logo: {
          alt: 'McJty Logo',
          src: 'img/logo.png',
        },
        items: [
          {
            type: 'doc',
            docId: 'intro',
            position: 'left',
            label: 'Docs',
          },
          /*{
            to: '/blog',
            label: 'Blog',
            position: 'left'
          },*/
          {
            href: 'https://github.com/mcjtymods',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Tutorial',
                to: '/docs/intro',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'YouTube',
                href: 'https://www.youtube.com/channel/UCYMg1JQw3syJBgPeW6m68lA',
              },
              {
                label: 'Discord',
                href: 'https://discord.com/invite/YaWr7Zb',
              },
              {
                label: 'Twitter',
                href: 'https://twitter.com/McJty',
              },
            ],
          },
          {
            title: 'More',
            items: [
              /*{
                label: 'Blog',
                to: '/blog',
              },*/
              {
                label: 'Source Code',
                href: 'https://github.com/tomheaton/mcjty-website',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} McJty. Built with Docusaurus.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
        additionalLanguages: [
            "gradle",
            "java"
        ]
      },
    }),
};

module.exports = config;
