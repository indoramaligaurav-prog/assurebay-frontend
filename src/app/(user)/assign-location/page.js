"use client";

import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Grid,
  Stack,
  TextField,
  MenuItem,
  Button,
  Alert
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import * as api from "src/services";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "@bprogress/next";
import { updateUserRole } from '@/redux/slices/user';

import countries from "src/data/countries.json";

export default function AssignLocationPage() {
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();  // Add dispatch
  const router = useRouter();  // Ensure router is available


  const [formData, setFormData] = useState({
    user_id: "",
    state: "",
    city: "",
    pincode: "",
    address: "",
    country: ""
  });

  // 🔥 FIX: SET USER ID after redux loads
useEffect(() => {
  if (user && user._id) {
    const match = countries.find((c) => c.label === user.businessCountry);

    setFormData((prev) => ({
      ...prev,
      user_id: user._id,
      country: prev.country || match?.code || ''
    }));
  }
}, [user]);

  const [success, setSuccess] = useState(false);

  const mutation = useMutation({
    mutationFn: api.saveUserLocation,
   onSuccess: () => { 
    setSuccess(true);

     router.push("/create-shop");
   },
    onError: (error) => {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to submit location!";
      alert(msg);
    }
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("SENDING:", formData);
    mutation.mutate(formData);
  };

  return (
    <Container maxWidth="sm" sx={{ pt: 5, pb: 10 }}>
      <Typography variant="h4" fontWeight={700} align="center" gutterBottom>
        Where is your business Registered?
      </Typography>

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Location details submitted successfully!
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <Stack mt={3} spacing={3}>
          <Grid container spacing={3} >
            <Grid item xs={12} width={"100%"}>
              <Stack gap={3}>
                
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  multiline
                  rows={2}
                />

                <TextField
                  fullWidth
                  label="City"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                />

                <TextField
                  fullWidth
                  label="State"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                />

                <TextField
                  fullWidth
                  label="Pincode"
                  name="pincode"
                  type="number"
                  value={formData.pincode}
                  onChange={handleChange}
                />

                <TextField
                  select
                  fullWidth
                  label="Country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                >
                  <MenuItem value="" disabled>
                    Select One
                  </MenuItem>

                  {countries.map((c) => (
                    <MenuItem key={c.code} value={c.code}>
                      {c.label}
                    </MenuItem>
                  ))}
                </TextField>

                <Button variant="contained" type="submit" size="large" fullWidth>
                  Save Location
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Stack>
      </Box>
    </Container>
  );
}
