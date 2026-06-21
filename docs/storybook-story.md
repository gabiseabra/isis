# Storybook Story Pattern

Status: required
Scope: `ui/src/**/*.stories.tsx`
Good examples: `ui/src/feedback/Banner.stories.tsx`, `ui/src/feedback/EmptyState.stories.tsx`, `ui/src/feedback/Spinner.stories.tsx`, `ui/src/form/Select.stories.tsx`, `ui/src/form/Autocomplete.stories.tsx`

## Purpose

Stories document the component API with small, controlled examples. They show component states and variants using demo data, existing project components, and the component API.

## How to read this document

Read this file top to bottom before editing a story. Apply each section only to the scope it describes; examples do not override explicit rules.

Before placing a helper/component, decide whether it is shared by multiple stories or used by one story. Shared helpers go before `meta`; one-story helpers go immediately before the story export that uses them.

If placement is still unclear, follow the matching file listed in `Examples read` instead of inventing a new layout.

## File shape

Use this order:

1. The component and its exported props type.
2. Story props and shared helpers.
3. `meta`.
4. `type Story`.
5. `export default meta`.
6. Named story exports.

```tsx
type ComponentStoryProps = Pick<ComponentProps, "disabled" | "placeholder">;

const meta: Meta<ComponentStoryProps> = {
  title: "Category/Component",
  args: {
    disabled: false,
    placeholder: "Placeholder",
  },
};

type Story = StoryObj<ComponentStoryProps>;

export default meta;

export const Default: Story = {
  render: (props) => <Component {...props} />,
};
```

## Story props and helpers

Define a story props type based on the component's base props. Expose controls for useful scalar story args: selected component props plus simple story-only args. Keep complex props and composition inside the story render function. Follow by pure helpers shared by many stories.

Shared helpers used by multiple stories go before `meta`. A helper/component used by one story goes immediately before that story export.

```tsx
type SelectStoryProps = Pick<SelectProps, "disabled" | "placeholder">;

const options = [
  { value: "first", textValue: "First option" },
  { value: "second", textValue: "Second option" },
  { value: "third", textValue: "Third option" },
  { value: "four", textValue: "Fourth option" },
]

const DemoOptions = () =>
  options.map((option) => (
    <Select.Item key={option.value} {...option}>
      {option.textValue}
    </Select.Item>
  ));
```

## Meta

Type `meta` with the story props type. The `title` matches the component area and component name, for example `Feedback/Banner`, `Form/Select`, or `Form/Autocomplete`.

Declare scalar controls in `meta.args`. Storybook infers the control type from the default value, so args are required for scalar controls to appear.

Use `argTypes` inside the same `meta` object when a scalar control needs a select option list.

Do not declare render in `meta`!!!

```tsx
const bannerTypes = ["neutral", "success", "warning", "error", "info"] as const;

const meta: Meta<BannerStoryProps> = {
  title: "Feedback/Banner",
  args: {
    type: "info",
    title: "Banner title",
    message: "Banner message",
  },
  argTypes: {
    type: {
      control: "select",
      options: bannerTypes,
    },
  },
};
```

## Story type

Use the story props type for stateful wrapper stories.

```tsx
type Story = StoryObj<SelectStoryProps>;
```

## Named story exports

Use short, product-readable story names:

- `Default`
- `Multiple`
- `Types`
- `WithIcon`
- `WithAction`
- `Bounded`

Each story documents one meaningful component state or feature. Put `render` in the story object, not in `meta`.

The default story should always be the most simple "happy path" case of the base component.

```tsx
export const Default: Story = {
  render: (props) => <Button {...props} />
}
```

## Aggregate stories

For aggregate variant stories that render every option, exclude the controlled option so each rendered variant stays fixed.

Wrap the variants in `Row`/`Col` (depending on the direction of the base component) with gap=2.

```tsx
export const Types: Story = {
  parameters: {
    controls: {
      exclude: ["type"],
    },
  },
  render: ({ message, ...args }) => (
    <Col gap={2}>
      {bannerTypes.map((type) => (
        <Banner key={type} {...args} type={type} title={`${type} banner`}>
          {message}
        </Banner>
      ))}
    </Col>
  ),
};
```

### Stateful stories

If a story uses React state or a hook-driven trigger, create a named local wrapper/trigger component immediately before the story export that uses it. Call hooks there. Use one component per story; do not compose stateful components. Declare `Story` components directly before the story that uses it.

```tsx
function SelectStory(props: SelectStoryProps) {
  const [value, setValue] = useState("first");

  return (
    <Select {...props} value={value} onValueChange={setValue}>
      <DemoOptions />
    </Select>
  );
}

export const Default: Story = {
  render: (props) => <SelectStory {...props} />,
};
```

### Composition stories

Bild the story from the component's own helper API and existing layout components.

```tsx
export const Bounded: Story = {
  render: (props) => (
    <Select.Boundary padding={2} asChild>
      <Card elevation={1} px={10} py={20} alignX="center" alignY="center">
        <MultiSelectStory {...props} />
      </Card>
    </Select.Boundary>
  ),
};
```
