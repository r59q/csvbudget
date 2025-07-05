When writing react, always use functional components, with the syntax
```typescript jsx
interface ComponentProps {
    // Define your props here
}

const ComponentName = ({}: ComponentProps) => {
    return <>
        {/* Your JSX code here */}
    </>
};
```
or if you need to use children:
```typescript jsx
const ComponentName = ({}: PropsWithChildren<ComponentProps<any>>) => {
    return <>
        {/* Your JSX code here */}
    </>
};
```

Any javascript is always TypeScript, so use TypeScript syntax for types and interfaces. Prefer using interfaces over types for defining whenever possible.

All react code is written using the Next.js framework. Styles are applied using Tailwind CSS. Use Tailwind classes for styling components. Always use the Link component from 'next/link' for navigation, and the Image component from 'next/image' for images.

Icons are always available from the react-icons library, so use those for any icons needed.

in src/model.ts there's an overview of the types used in the application. Prefer using these whenever possible.