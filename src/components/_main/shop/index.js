'use client';

import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Stack,
  TextField,
  Button,
  Divider
} from "@mui/material";
import { useRouter } from '@bprogress/next';
import { useSelector } from 'react-redux';
import { checkUserZone } from 'src/services';
import { useDispatch } from 'react-redux';
import { updateUserRole } from '@/redux/slices/user';
import { createShop, sendPhoneOtp, verifyPhoneOtp } from 'src/services';
import toast from 'react-hot-toast';
import PhoneInputField from '@/components/phone-input-field';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const inputStyle = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '999px',
    height: 58,
    bgcolor: '#fff',
  }
};

// ── Reusable upload dropzone ──
function UploadBox({ label, file, onChange, accept = "image/*" }) {
  const isImage = file && file.type?.startsWith("image/");

  return (
    <Box>
      <Typography variant="overline" color="text.primary" component="label" mb={0.5} display="block">
        {label}
      </Typography>
      <Box
        component="label"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          border: '1.5px dashed',
          borderColor: file ? 'success.main' : 'grey.400',
          borderRadius: 3,
          p: 2,
          cursor: 'pointer',
          bgcolor: file ? 'success.lighter' : 'grey.50',
          transition: 'all 0.2s',
          '&:hover': { borderColor: 'primary.main', bgcolor: 'grey.100' }
        }}
      >
        <input hidden type="file" accept={accept} onChange={onChange} />

        {file ? (
          isImage ? (
            <Box
              component="img"
              src={URL.createObjectURL(file)}
              alt="preview"
              sx={{ width: 44, height: 44, borderRadius: 1.5, objectFit: 'cover', flexShrink: 0 }}
            />
          ) : (
            <InsertDriveFileIcon sx={{ fontSize: 36, color: 'text.secondary', flexShrink: 0 }} />
          )
        ) : (
          <CloudUploadIcon sx={{ fontSize: 32, color: 'grey.500', flexShrink: 0 }} />
        )}

        <Box flex={1} minWidth={0}>
          <Typography fontSize={14} fontWeight={600} noWrap>
            {file ? file.name : `Upload ${label}`}
          </Typography>
          <Typography fontSize={12} color="text.secondary">
            {file ? 'Click to replace' : 'PNG, JPG or PDF'}
          </Typography>
        </Box>

        {file && <CheckCircleIcon color="success" sx={{ flexShrink: 0 }} />}
      </Box>
    </Box>
  );
}

export default function AdminShopMain() {
  const { user } = useSelector((state) => state.user);
  const router = useRouter();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [kycDocs, setKycDocs] = useState([]);
  const [files, setFiles] = useState({});
  const [shopName, setShopName] = useState("");

  // ── Phone verification state ──
  const [shopPhone, setShopPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    const verifyZone = async () => {
      try {
        const res = await checkUserZone(user._id);

        if (!res.assigned) {
          router.push("/assign-location");
          return;
        }

        setKycDocs(res.kyc_docs || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    verifyZone();
  }, [user, router]);

  const handleSendOtp = async () => {
    if (!shopPhone?.trim()) {
      setPhoneError("Enter a phone number first");
      return;
    }
    setPhoneError("");
    setOtpLoading(true);
    try {
      await sendPhoneOtp(shopPhone);
      setOtpSent(true);
      toast.success("OTP sent");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setOtpLoading(true);
    try {
      await verifyPhoneOtp(shopPhone, otpCode);
      setPhoneVerified(true);
      toast.success("Phone verified");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid code");
    } finally {
      setOtpLoading(false);
    }
  };

  const isFormValid = (() => {
    if (!shopName.trim()) return false;
    if (!phoneVerified) return false;
    if (!files.logo) return false;

    const allKycUploaded = kycDocs.every(doc => files[doc]);
    return allKycUploaded;
  })();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("shopName", shopName);
    formData.append("vendor", user._id);
    formData.append("shopPhone", shopPhone);

    Object.keys(files).forEach((key) => {
      formData.append(key, files[key]);
    });

    try {
      const res = await createShop(formData);
      const url = res.verificationUrl || res.data?.verificationUrl;

      if (!url) {
        alert("Verification URL missing");
        return;
      }

      toast.success("Redirecting to identity verification...");
      window.location.href = url;
    } catch (err) {
      console.error("Shop creation error:", err);
      alert("Error submitting shop: " + err.message);
    }
  };

  const isImage = (file) => file && file.type.startsWith("image/");
  const isPdf = (file) => file && file.type === "application/pdf";

  if (loading) return <Typography align="center">Loading...</Typography>;

  return (
    <Container maxWidth="sm" sx={{ pt: 5, pb: 10, backgroundColor: "background.paper" }}>
      <Typography variant="h4" fontWeight={700} align="center" gutterBottom>
        Shop Verification
      </Typography>

      <Typography variant="body2" align="center" color="text.secondary" mb={3}>
        Please provide shop details and required KYC documents
      </Typography>

      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={3}>

          {/* Shop Name */}
          <Stack gap={0.5}>
            <Typography variant="overline" color="text.primary" component="label">
              Shop Name
            </Typography>
            <TextField
              fullWidth
              placeholder="Shop name"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              required
              sx={inputStyle}
            />
          </Stack>

          {/* Phone Number + OTP */}
          <Stack gap={0.5}>
            <Typography variant="overline" color="text.primary" component="label">
              Shop Contact Number
            </Typography>

            <Stack direction="row" spacing={1.5} alignItems="flex-start">
              <Box flex={1}>
                <PhoneInputField
                  error={phoneError}
                  onChange={(val) => setShopPhone(val)}
                  value={shopPhone}
                  disabled={phoneVerified}
                />
              </Box>
              {!phoneVerified && (
                <Button
                  variant="contained"
                  onClick={handleSendOtp}
                  disabled={otpLoading || !shopPhone?.trim()}
                  sx={{
                    height: 58,
                    borderRadius: '999px',
                    textTransform: 'none',
                    px: 3,
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                  }}
                >
                  {otpSent ? "Resend" : "Send OTP"}
                </Button>
              )}
            </Stack>

            {otpSent && !phoneVerified && (
              <Stack direction="row" spacing={1.5} mt={1}>
                <TextField
                  fullWidth
                  placeholder="Enter OTP"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  sx={inputStyle}
                />
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleVerifyOtp}
                  disabled={otpLoading || !otpCode.trim()}
                  sx={{
                    height: 58,
                    borderRadius: '999px',
                    textTransform: 'none',
                    px: 3,
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                  }}
                >
                  Verify
                </Button>
              </Stack>
            )}

            {phoneVerified && (
              <Stack direction="row" spacing={0.5} alignItems="center" mt={0.5}>
                <CheckCircleIcon color="success" fontSize="small" />
                <Typography fontSize={13} color="success.main">
                  Phone number verified
                </Typography>
              </Stack>
            )}
          </Stack>

          {/* Logo Upload */}
          <UploadBox
            label="Shop Logo"
            file={files.logo}
            accept="image/*"
            onChange={(e) => setFiles(prev => ({ ...prev, logo: e.target.files[0] }))}
          />

          <Divider />

          {/* KYC Section */}
          <Typography variant="h6" fontWeight={600}>
            KYC Documents
          </Typography>

          <Grid container spacing={2}>
            {kycDocs.map((doc) => (
              <Grid item xs={12} key={doc}>
                <UploadBox
                  label={doc}
                  file={files[doc]}
                  accept="image/*,application/pdf"
                  onChange={(e) => {
                    const selected = e.target.files[0];

                    if (selected && !isImage(selected) && !isPdf(selected)) {
                      alert("Only image or PDF allowed");
                      return;
                    }

                    setFiles(prev => ({ ...prev, [doc]: selected }));
                  }}
                />
              </Grid>
            ))}
          </Grid>

          <Button
            variant="contained"
            size="large"
            type="submit"
            fullWidth
            disabled={!isFormValid}
            sx={{ borderRadius: '999px', height: 52, textTransform: 'none', fontSize: 16, fontWeight: 600 }}
          >
            Submit For Verification
          </Button>

        </Stack>
      </Box>
    </Container>
  );
}