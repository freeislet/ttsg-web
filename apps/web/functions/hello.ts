// functions/hello.ts
export const onRequest: PagesFunction = async (context) => {
  return new Response('Hello from Functions!')
}
