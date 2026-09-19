"use client";
import { Provider } from "react-redux";
import "./globals.css";

import {store} from "../app/redux/store.js";


export default function RootLayout({ children }) {
  return (
    <Provider store={store}>
      <html lang="en"> 
        <body className="min-h-full flex flex-col">{children}</body>
      </html>
    </Provider>
  );
}
