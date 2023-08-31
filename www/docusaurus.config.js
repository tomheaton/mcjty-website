// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require("prism-react-renderer/themes/github");
const darkCodeTheme = require("prism-react-renderer/themes/dracula");

const metadata = {
  title: "Mcjty",
  tagline: "Maker of RFTools, McJtyLib, Deep Resonance, and Gear Swapper.",
  description:
    "Mod developer. Maker of RFTools, McJtyLib, Deep Resonance, and Gear Swapper mods. Creator of the On The Edge hardcore/tech modpack. ForgeCraft member",
  image: "/img/logo.png",
  tags: "Minecrafter, Mod Developer, Mods, Minecraft Mods, Modder, Developer, Modpacks, Modpack Developer, RFTools, McJty, Mc Jty, RFTools Dimensions, RFTools Control, XNet, Interaction Wheel, Gear Swapper, Immersive Craft, Aqua Munda, McJtyLib, CompatLayer, In Control!, The One Probe, Deep Resonance, xNICEx, CombatHelp, Elemental Dimensions, On The Edge, McJty's Lets Play Pack",
  url: "https://mcjty.eu",
  color: "#36B99F",
};

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: metadata.title,
  tagline: metadata.tagline,
  url: metadata.url,
  baseUrl: "/",
  onBrokenLinks: "warn",
  onBrokenMarkdownLinks: "warn",
  favicon: "img/favicon.ico",
  organizationName: "tomheaton",
  projectName: "mcjty-website",
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },
  headTags: [
    {
      tagName: "link",
      attributes: {
        rel: "icon",
        type: "image/png",
        href: "/img/favicons/favicon-16x16.png",
        sizes: "16x16",
      },
    },
    {
      tagName: "link",
      attributes: {
        rel: "icon",
        type: "image/png",
        href: "/img/favicons/favicon-32x32.png",
        sizes: "32x32",
      },
    },
    {
      tagName: "link",
      attributes: {
        rel: "icon",
        type: "image/png",
        href: "/img/favicons/favicon-194x194.png",
        sizes: "194x194",
      },
    },
    {
      tagName: "link",
      attributes: {
        rel: "icon",
        type: "image/png",
        href: "/img/favicons/android-chrome-192x192.png",
        sizes: "192x192",
      },
    },
    {
      tagName: "link",
      attributes: {
        rel: "icon",
        type: "image/png",
        href: "/img/favicons/android-chrome-384x384.png",
        sizes: "384x384",
      },
    },
    {
      tagName: "link",
      attributes: {
        rel: "apple-touch-icon",
        type: "image/png",
        href: "/img/favicons/apple-touch-icon.png",
        sizes: "180x180",
      },
    },
  ],
  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
          editUrl: "https://github.com/tomheaton/mcjty-website/tree/main/",
        },
        blog: false /*{
          showReadingTime: true,
          editUrl:
            'https://github.com/tomheaton/mcjty-website/tree/main/',
        },*/,
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      metadata: [
        { name: "theme-color", content: metadata.color },
        { name: "author", content: metadata.title },
        { name: "description", content: metadata.description },
        { name: "keywords", content: metadata.tags },
        { name: "og:title", content: metadata.title },
        { name: "og:type", content: "website" },
        { name: "og:url", content: metadata.url },
        { name: "og:image", content: metadata.image },
        { name: "og:locale", content: "en_US" },
        { name: "og:locale:alternate", content: "en_GB" },
        { name: "og:description", content: metadata.description },
        { name: "og:site_name", content: "McJty.Eu" },
        { name: "twitter:card", content: "summary" },
        { name: "twitter:site", content: "@McJty" },
        { name: "twitter:title", content: metadata.title },
        { name: "twitter:description", content: metadata.description },
        { name: "twitter:image", content: metadata.image },
      ],
      docs: {
        sidebar: {
          hideable: true,
        },
      },
      navbar: {
        title: "McJty Wiki",
        logo: {
          alt: "McJty Logo",
          src: "img/logo.png",
        },
        items: [
          {
            type: "doc",
            docId: "intro",
            position: "left",
            label: "Tutorials",
          },
          {
            // type: "doc",
            // docId: "mods/mods",
            type: "docSidebar",
            sidebarId: "mods",
            position: "left",
            label: "Mod Docs",
          },
          {
            to: "/control-validator",
            label: "Control Validator",
            position: "left",
          },
          /*{
            to: "/blog",
            label: "Blog",
            position: "left",
          },*/
          // TODO: replace text with icons
          {
            href: "https://www.curseforge.com/members/mcjty/projects",
            label: "CurseForge",
            position: "right",
          },
          {
            href: "https://github.com/mcjtymods",
            label: "GitHub",
            position: "right",
          },
        ],
      },
      footer: {
        style: "dark",
        links: [
          {
            title: "Tutorials",
            items: [
              {
                label: "1.19",
                to: "/docs/1.19",
              },
              {
                label: "1.18",
                to: "/docs/1.18",
              },
              {
                label: "1.17",
                to: "/docs/1.17",
              },
              {
                label: "1.14, 1.15, and 1.16",
                to: "/docs/1.14-1.15-1.16",
              },
              {
                label: "1.15",
                to: "/docs/1.15",
              },
              {
                label: "1.12",
                to: "/docs/1.12",
              },
            ],
          },
          {
            title: "Docs",
            items: [
              {
                label: "Mod Docs",
                to: "/docs/mods",
              },
            ],
          },
          {
            title: "Community",
            items: [
              {
                label: "YouTube",
                href: "https://www.youtube.com/channel/UCYMg1JQw3syJBgPeW6m68lA",
              },
              {
                label: "Discord",
                href: "https://discord.com/invite/YaWr7Zb",
              },
              {
                label: "Twitter",
                href: "https://twitter.com/McJty",
              },
              {
                label: "Reddit",
                href: "https://www.reddit.com/user/McJty",
              },
              {
                label: "Twitch",
                href: "https://www.twitch.tv/McJty",
              },
              {
                label: "Patreon",
                href: "https://www.patreon.com/McJty",
              },
            ],
          },
          {
            title: "More",
            items: [
              /*{
                label: 'Blog',
                to: '/blog',
              },*/
              {
                label: "Source Code",
                href: "https://github.com/tomheaton/mcjty-website",
              },
            ],
          },
        ],
        logo: {
          alt: "McJty Logo",
          src: metadata.image,
          href: metadata.url,
          width: 135,
          height: 135,
        },
        copyright: `Copyright &copy; ${new Date().getFullYear()} McJty. Made with &hearts; by <a href="https://tomheaton.dev">tomheaton<a>`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
        additionalLanguages: ["gradle", "java"],
      },
    }),
};

module.exports = config;
