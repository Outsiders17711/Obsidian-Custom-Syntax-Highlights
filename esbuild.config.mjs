import esbuild from "esbuild";

const context = await esbuild.context({
  entryPoints: ["main.ts"],
  bundle: true,
  external: ["obsidian", "@codemirror/state", "@codemirror/view", "@codemirror/language"],
  format: "cjs",
  target: "es2016",
  outfile: "main.js",
  treeShaking: true,
  minify: false,
  sourcemap: "inline",
  define: {
    global: "globalThis",
  },
});

if (process.argv.includes("--watch")) {
  await context.watch();
  console.log("watching...");
} else {
  await context.rebuild();
  await context.dispose();
  console.log("build complete");
}
