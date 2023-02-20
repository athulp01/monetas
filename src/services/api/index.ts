import page from "./templates/page.html";
import { apiStatus } from "./lib/api/status";
import { apiSuppliers, apiSupplier } from "./lib/api/suppliers";
import { apiProducts, apiProduct } from "./lib/api/products";
import { apiOrders, apiOrder } from "./lib/api/orders";
import { apiEmployees, apiEmployee } from "./lib/api/employees";
import { apiCustomer, apiCustomers } from "./lib/api/customers";
import { apiSearch } from "./lib/api/search";
import { getMime } from "./lib/tools";

// insert API endpoints here
const apiEndpoints: Array<any> = [];
apiEndpoints.push(apiStatus());
apiEndpoints.push(apiSupplier());
apiEndpoints.push(apiSuppliers());
apiEndpoints.push(apiProduct());
apiEndpoints.push(apiProducts());
apiEndpoints.push(apiOrders());
apiEndpoints.push(apiOrder());
apiEndpoints.push(apiEmployee());
apiEndpoints.push(apiEmployees());
apiEndpoints.push(apiCustomer());
apiEndpoints.push(apiCustomers());
apiEndpoints.push(apiSearch());

export default {
    async fetch(request: Request, env: Env) {
        try {
            return handleRequest(request, env);
        } catch (e) {
            return new Response(`${e}`);
        }
    },
};

const htmlHeaders = (contentType: string) => {
    return {
        headers: {
            "content-type": `${contentType};charset=UTF-8`,
            "Access-Control-Allow-Origin": "*",
        },
        status: 200,
    };
};

async function jsonReply(json: object, status = 200) {
    return new Response(JSON.stringify(json), {
        headers: {
            "content-type": "application/json;charset=UTF-8",
            "access-control-allow-origin": "*",
            "access-control-allow-headers": "*",
            "access-control-allow-methods": "*",
        },
        status: status,
    });
}

async function handleRequest(request: Request, env: Env) {
    let url = new URL(request.url);
    let [path, param] = url.pathname.slice(1).split("/");

    const api = apiEndpoints.map((ep) => `${ep.method},${ep.path}`).indexOf(`${request.method},${param}`);

    if (api != -1) {
        const apiResult = await apiEndpoints[api].handler(request, env);
        return jsonReply(apiResult, apiResult.error ? apiResult.error : 200);
    } else {
        if (env.USE_KV_PAGES && ["app.js", "app.css"].includes(path)) {
            const val = await env.assets.get(path, { type: "text" });
            return new Response(val, htmlHeaders(getMime(path)));
        } else {
            return new Response(page, htmlHeaders("text/html"));
        }
    }
}

interface Env {
    DB: D1Database;
    USE_KV_PAGES: string;
    assets: KVNamespace;
}
