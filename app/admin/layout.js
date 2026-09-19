// app/admin/layout.tsx — fixed
"use client"
import { Provider } from "react-redux";
import {store} from "../redux/store.js"

export default function AdminLayout({ children }) {
  return (
    <Provider store={store}>
      <div className="admin-shell">
        {children}
      </div>
    </Provider>
  );
}