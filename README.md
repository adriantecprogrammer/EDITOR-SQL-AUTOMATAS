# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project
npx sv create my-app
```

To recreate this project with the same configuration:

```sh
# recreate this project
npx sv@0.12.8 create --template minimal --types ts --add prettier eslint tailwindcss="plugins:typography" --install npm EDITOR-SQL-AUTOMATAS
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.

docker compose up -d

docker compose down




vamos a crear MiEscuela
comenzar a usar MiEscuela

vamos a guardar información sobre estudiantes
    vamos a recordar nombre que es texto
    vamos a recordar edad que es número
    vamos a recordar fecha_nacimiento que es fecha
    es amiga de clases
terminamos esta tabla

vamos a guardar información sobre clases
    vamos a recordar nombre_clase que es texto
    vamos a recordar salon que es texto
    es amiga de profesores
terminamos esta tabla

vamos a guardar información sobre profesores
    vamos a recordar nombre que es texto
    vamos a recordar especialidad que es texto
terminamos esta tabla

mostrar lo aprendido



//////////////////////////////////////////7


vamos a crear MiEscuela
comenzar a usar MiEscuela

vamos a guardar información sobre estudiantes
    vamos a recordar nombre que es texto
    vamos a recordar edad que es número
terminamos esta tabla

mostrar lo aprendido