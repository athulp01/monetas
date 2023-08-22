import React, { useEffect, useState } from "react";
import type { AppType } from "next/app";
import Head from "next/head";
import { Provider } from "react-redux";

import { store } from "../stores/store";
import "../css/main.css";
import { Router, useRouter } from "next/router";
import { Bars } from "react-loader-spinner";

import SectionFullScreen from "../components/common/sections/SectionFullScreen";
import "flowbite";
import { ToastContainer } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";
import {
  ClerkProvider,
  RedirectToSignIn,
  SignedIn,
  SignedOut,
} from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/react";

import LayoutAuthenticated from "~/components/layout";
import { api } from "../utils/api";

const publicPages = [
  "/sign-in/[[...index]]",
  "/sign-up/[[...index]]",
  "/telegram/unverified/[transactionId]",
  "/privacy-policy",
];

const MyApp: AppType = ({ Component, pageProps }) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Check if the current route matches a public page
  const isPublicPage = publicPages.includes(router.pathname);

  useEffect(() => {
    Router.events.on("routeChangeStart", () => {
      setIsLoading(true);
    });
    Router.events.on("routeChangeComplete", () => {
      setIsLoading(false);
    });
    Router.events.on("routeChangeError", () => {
      setIsLoading(false);
    });
  }, []);

  const title = `Monetas`;
  const description = "Personal finance manager";
  const url = "https://monetas.athulp.in.net";
  const image = `/ss.png`;
  const imageWidth = "1920";
  const imageHeight = "960";

  return (
    <ClerkProvider {...pageProps}>
      <Provider store={store}>
        <>
          <Head>
            <meta name="description" content={description} />
            <meta property="og:url" content={url} />
            <meta property="og:site_name" content="Monetas" />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />
            <meta property="og:image:type" content="image/png" />
            <meta property="og:image:width" content={imageWidth} />
            <meta property="og:image:height" content={imageHeight} />
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:title" content={title} />
            <meta property="twitter:description" content={description} />
            <meta property="twitter:image:src" content={image} />
            <meta property="twitter:image:width" content={imageWidth} />
            <meta property="twitter:image:height" content={imageHeight} />
          </Head>
          {isLoading && (
            <SectionFullScreen>
              <Bars
                height="80"
                width="80"
                color="black"
                ariaLabel="bars-loading"
                wrapperStyle={{}}
                wrapperClass=""
                visible={isLoading}
              />
            </SectionFullScreen>
          )}
          {isPublicPage ? (
            <Component {...pageProps} />
          ) : (
            <>
              <SignedIn>
                <LayoutAuthenticated>
                  <Component {...pageProps} />
                </LayoutAuthenticated>
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          )}
          <ToastContainer
            hideProgressBar
            position="top-right"
            autoClose={5000}
            draggable
          />
          <Analytics />
        </>
      </Provider>
    </ClerkProvider>
  );
};

export default api.withTRPC(MyApp);
