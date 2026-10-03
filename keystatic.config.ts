import { config, fields, singleton } from '@keystatic/core';

/**
 * Keystatic admin panel for the Limitless website.
 *
 * Local development edits the YAML files in src/content directly.
 * In production, set PUBLIC_KEYSTATIC_CLOUD_PROJECT (e.g. "limitless/website")
 * and edits are saved through Keystatic Cloud as commits to GitHub, which
 * triggers a Vercel redeploy. Editors do not need a GitHub account.
 */
const cloudProject = import.meta.env.PUBLIC_KEYSTATIC_CLOUD_PROJECT as string | undefined;
const useCloud = Boolean(import.meta.env.PROD && cloudProject);

const boldHint = 'Tip: wrap words in **double asterisks** to make them bold.';

const line = (label: string, description?: string) =>
  fields.text({ label, description, validation: { length: { min: 1 } } });

const paragraph = (label: string, description?: string) =>
  fields.text({ label, description, multiline: true, validation: { length: { min: 1 } } });

const list = (label: string, itemLabel: string, description?: string) =>
  fields.array(fields.text({ label: itemLabel, validation: { length: { min: 1 } } }), {
    label,
    description,
    itemLabel: (props) => props.value || itemLabel,
  });

export default config({
  storage: useCloud ? { kind: 'cloud' } : { kind: 'local' },
  ...(useCloud ? { cloud: { project: cloudProject! } } : {}),

  ui: {
    brand: { name: 'Limitless website' },
    navigation: {
      'Homepage, top to bottom': ['hero', 'approach', 'services', 'process', 'about', 'contact'],
      'Practice details': ['settings'],
    },
  },

  singletons: {
    /* ------------------------------------------------------------ */
    settings: singleton({
      label: 'Contact details, insurance & search',
      path: 'src/content/settings',
      format: { data: 'yaml' },
      schema: {
        practiceName: line('Practice name'),
        phones: fields.array(
          fields.object({
            number: line('Phone number', 'Shown exactly as typed, e.g. 908-331-3122.'),
            label: fields.text({ label: 'Label (optional)', description: 'e.g. "Call or text". Leave blank for no label.' }),
          }),
          {
            label: 'Phone numbers',
            description: 'The first number is used for the "Call" button at the top of the site.',
            itemLabel: (props) => props.fields.number.value || 'Phone number',
          },
        ),
        email: line('Email address'),
        addressLine1: line('Address line 1'),
        addressLine2: line('Address line 2'),
        mapsUrl: fields.url({
          label: 'Map link (optional)',
          description: 'A Google Maps link for the address. Leave blank to hide the "Get directions" link.',
        }),
        insuranceHeading: line('Insurance heading'),
        insurancePlans: list('In-network insurance plans', 'Plan name'),
        insuranceNote: paragraph('Insurance note', 'Shown under the plan names.'),
        footerBlurb: paragraph('Footer description', 'The short description at the very bottom of the site.'),
        seoTitle: line('Browser tab & Google title'),
        seoDescription: paragraph('Google description', 'One or two sentences. This is what Google shows under the title.'),
        formAccessKey: fields.text({
          label: 'Contact form key (advanced)',
          description:
            'Optional Web3Forms access key. When set, the contact form sends messages straight to your inbox. When blank, the form opens the visitor’s email app instead.',
        }),
      },
    }),

    /* ------------------------------------------------------------ */
    hero: singleton({
      label: 'Top of the page',
      path: 'src/content/hero',
      format: { data: 'yaml' },
      schema: {
        headline: line('Headline', 'The large opening line. Keep it short, ideally under six words.'),
        subheadline: paragraph('Supporting sentence', 'One sentence under the headline. Around 20 words reads best.'),
        primaryCta: line('Main button text', 'Takes visitors to the contact form.'),
        facts: fields.array(
          fields.object({
            text: line('Fact'),
            icon: fields.select({
              label: 'Icon',
              options: [
                { label: 'Shield (insurance)', value: 'shield-check' },
                { label: 'Certificate', value: 'certificate' },
                { label: 'People (ages)', value: 'users' },
                { label: 'Map pin (location)', value: 'map-pin' },
                { label: 'Calendar', value: 'calendar-blank' },
                { label: 'Heart', value: 'heart' },
              ],
              defaultValue: 'certificate',
            }),
          }),
          {
            label: 'Quick facts under the opening',
            description: 'Short, true facts about the practice. Four works best.',
            itemLabel: (props) => props.fields.text.value || 'Fact',
          },
        ),
      },
    }),

    /* ------------------------------------------------------------ */
    approach: singleton({
      label: 'How we work',
      path: 'src/content/approach',
      format: { data: 'yaml' },
      schema: {
        statement: paragraph('Large statement', 'The big sentence that highlights as visitors scroll.'),
        body: paragraph('Supporting paragraph', `Leave an empty line between paragraphs. ${boldHint}`),
        principles: fields.array(
          fields.object({
            title: line('Title'),
            text: paragraph('Description'),
            icon: fields.select({
              label: 'Icon',
              options: [
                { label: 'Open book (research)', value: 'book-open-text' },
                { label: 'Fingerprint (individual)', value: 'fingerprint' },
                { label: 'Shapes (play)', value: 'shapes' },
                { label: 'Infinity (neurodiversity)', value: 'infinity' },
                { label: 'Three people (collaboration)', value: 'users-three' },
                { label: 'House (everyday life)', value: 'house-line' },
                { label: 'Heart', value: 'heart' },
                { label: 'Chat bubbles', value: 'chats-circle' },
              ],
              defaultValue: 'heart',
            }),
          }),
          { label: 'Principles', itemLabel: (props) => props.fields.title.value || 'Principle' },
        ),
      },
    }),

    /* ------------------------------------------------------------ */
    services: singleton({
      label: 'Services',
      path: 'src/content/services',
      format: { data: 'yaml' },
      schema: {
        heading: line('Section heading'),
        intro: paragraph('Introduction'),
        areas: fields.array(
          fields.object({
            title: line('Service area'),
            summary: paragraph('Description', boldHint),
            tags: list('Specific areas', 'Area'),
          }),
          {
            label: 'Service areas',
            description: 'Each one opens to show its description. Drag to reorder.',
            itemLabel: (props) => props.fields.title.value || 'Service area',
          },
        ),
      },
    }),

    /* ------------------------------------------------------------ */
    process: singleton({
      label: 'How therapy works',
      path: 'src/content/process',
      format: { data: 'yaml' },
      schema: {
        heading: line('Section heading'),
        steps: fields.array(
          fields.object({
            title: line('Step title'),
            text: paragraph('Description', boldHint),
          }),
          { label: 'Steps', itemLabel: (props) => props.fields.title.value || 'Step' },
        ),
      },
    }),

    /* ------------------------------------------------------------ */
    about: singleton({
      label: 'About Alyssa',
      path: 'src/content/about',
      format: { data: 'yaml' },
      schema: {
        label: line('Small label above the name'),
        name: line('Name and credentials'),
        lede: paragraph('Opening sentence'),
        bio: paragraph('Biography', `Leave an empty line between paragraphs. ${boldHint}`),
        photo: fields.image({
          label: 'Photo',
          description: 'A portrait works best (taller than it is wide).',
          directory: 'src/assets/uploads',
          publicPath: '/src/assets/uploads/',
        }),
        photoAlt: line('Photo description', 'Describes the photo for people using screen readers.'),
        credentials: list('Credentials & licensure', 'Credential'),
        training: list('Advanced training', 'Training'),
        focus: list('Areas of focus', 'Area'),
      },
    }),

    /* ------------------------------------------------------------ */
    contact: singleton({
      label: 'Contact section',
      path: 'src/content/contact',
      format: { data: 'yaml' },
      schema: {
        heading: line('Heading'),
        intro: paragraph('Introduction'),
        formNote: paragraph('Note under the form', 'A short privacy reminder for visitors.'),
        submitLabel: line('Send button text'),
        successMessage: paragraph('Message after sending'),
      },
    }),
  },
});
