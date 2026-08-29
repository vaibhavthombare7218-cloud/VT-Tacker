const CACHE_NAME = "rdkh-app-v2";

const FILES_TO_CACHE = [

    "./",
    "./login.html",
    "./login.js",

    "./index.html",
    "./style.css",
    "./app.js",

    "./income.html",
    "./income.js",

    "./expense.html",
    "./expense.js",

    "./transactions.html",
    "./transactions.js",

    "./accounts.html",
    "./accounts.js",

    "./monthly-budget.html",
    "./monthly-budget.js",

    "./reports.html",
    "./reports.js",

    "./settings.html",
    "./settings.js",

    "./manifest.json"

];


self.addEventListener(
    "install",
    event => {

        event.waitUntil(

            caches.open(
                CACHE_NAME
            )
            .then(
                cache => {

                    return cache.addAll(
                        FILES_TO_CACHE
                    );

                }
            )

        );

        self.skipWaiting();

    }
);


self.addEventListener(
    "activate",
    event => {

        event.waitUntil(

            caches.keys()
                .then(
                    keys => {

                        return Promise.all(

                            keys
                                .filter(
                                    key =>
                                        key !==
                                        CACHE_NAME
                                )
                                .map(
                                    key =>
                                        caches.delete(
                                            key
                                        )
                                )

                        );

                    }
                )

        );

        self.clients.claim();

    }
);


self.addEventListener(
    "fetch",
    event => {

        event.respondWith(

            caches.match(
                event.request
            )
            .then(
                cachedResponse => {

                    if (cachedResponse) {

                        return cachedResponse;

                    }

                    return fetch(
                        event.request
                    );

                }
            )

        );

    }
);
