// functions/hello.ts
export const onRequest: PagesFunction = async (_context) => {
  return new Response('Hello from Functions!')
}
