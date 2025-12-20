import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/index.tsx"),

  route("home", "routes/home.tsx", [
    route("recipes", "routes/home.recipes.tsx"),
    route("semantic-search", "routes/home.semantic-search.tsx"),
    route("ai-chat", "routes/home.ai-chat.tsx"),
  ]),
] satisfies RouteConfig;