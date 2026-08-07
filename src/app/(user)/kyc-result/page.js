"use client";

import React, { useEffect } from "react";
import { useRouter } from "@bprogress/next";
import { useDispatch } from 'react-redux';
import { updateUserRole } from '@/redux/slices/user';

export default function KycResult() {
  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    const redirect = async () => {
      await dispatch(updateUserRole());
      router.push("/vendor/dashboard");
    };

    const timer = setTimeout(redirect, 2000);
    return () => clearTimeout(timer);
  }, [router, dispatch]);

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>✅ Verification Completed</h2>
      <p>Redirecting to dashboard...</p>
    </div>
  );
}