# Angular HttpClient

## Node 22.40, npm 10.8.1, ng CLI: 18.2.12

## Providing the HttpClient when using NgModules:

Modern Angular apps typically use standalone components, not NgModules. But many Angular projects DO still use this "older approach".

Therefore, it's important to understand how you can provide Angular's HttpClient when working with NgModules.

Thankfully, it's pretty straightforward. Instead of providing the http client via provideHttpClient() passed to bootstrapApplication(), you pass it to the providers array of your root NgModule:

![httpClientNgModule](/HttpClient_NgModule.png)
