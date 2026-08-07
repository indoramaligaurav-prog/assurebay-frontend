'use client';
import React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
  IconButton,
  Grid,
  Skeleton,MenuItem,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Dialog,
  DialogTitle,
  DialogContent   
} from '@mui/material';
import { useFormik, FieldArray, FormikProvider } from 'formik';
import { FiEdit } from 'react-icons/fi';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from 'src/services';

export default function ZoneSettingsForm({ data = {}, isLoading }) {
  const queryClient = useQueryClient();

  const zones = data.zones || [];
  const countries = data.countries || [];

  const mutation = useMutation({
    mutationFn: api.saveZoneSettings,
    onSuccess: () => {
      toast.success("Zone saved successfully");
      queryClient.invalidateQueries(['get-zone-settings']);
      handleClose();
    }
  });

  const formik = useFormik({
    initialValues: {
      country_code: "",
      kyc_docs: [""]
    },
    onSubmit: (values) => {
      mutation.mutate(values);
    }
  });

  const [open, setOpen] = React.useState(false);
const [editZone, setEditZone] = React.useState(null);

const handleEdit = (zone) => {
  setEditZone(zone);
  formik.setValues({
    country_code: zone.country_code,
    kyc_docs: zone.kyc_docs.length ? zone.kyc_docs : [""]
  });
  setOpen(true);
};

const handleClose = () => {
  setOpen(false);
  setEditZone(null);
  formik.resetForm();
};


 const kycOptions = [
  // ───────────── PERSONAL IDENTITY ─────────────
  { value: "AADHAR", label: "Aadhaar Card (India)" },
  { value: "PAN", label: "PAN Card (India)" },
  { value: "PASSPORT", label: "Passport" },
  { value: "DRIVING_LICENSE", label: "Driving License" },
  { value: "VOTER_ID", label: "Voter ID" },
  { value: "EMIRATES_ID", label: "Emirates ID (UAE)" },
  { value: "SSN", label: "Social Security Number (USA)" },

  // ───────────── ADDRESS PROOF ─────────────
  { value: "UTILITY_BILL", label: "Utility Bill" },
  { value: "BANK_STATEMENT", label: "Bank Statement" },
  { value: "RENT_AGREEMENT", label: "Rent / Lease Agreement" },
  { value: "GOVERNMENT_LETTER", label: "Government Issued Address Proof" },

  // ───────────── BUSINESS KYC ─────────────
  { value: "BUSINESS_REGISTRATION", label: "Business Registration Certificate" },
  { value: "GST", label: "GST Registration (India)" },
  { value: "EIN", label: "EIN (USA)" },
  { value: "VAT", label: "VAT Registration (UAE)" },
  { value: "TRADE_LICENSE", label: "Trade License (UAE / India)" },
  { value: "UBO_DECLARATION", label: "UBO Declaration (UAE)" }
];

  if (isLoading) {
    return <Skeleton height={300} />;
  }

  return (
      <>
    <Card>
      <CardContent>
        <Typography variant="h6" mb={2}>
          Zone Settings
        </Typography>

        <FormikProvider value={formik}>
          <form onSubmit={formik.handleSubmit}>
            <Stack spacing={3}>
              <TextField
                select
                label="Country"
                name="country_code"
                value={formik.values.country_code}
                onChange={formik.handleChange}
                required
                 disabled={!!editZone}
              >
                {countries.map((c) => (
                  <MenuItem key={c.code} value={c.code}>
                    {c.label}
                  </MenuItem>
                ))}
              </TextField>

              <FieldArray name="kyc_docs" fullWidth>
                {({ push, remove }) => (
                  <Stack spacing={2}>
                    <Typography>KYC Documents</Typography>

                    {formik.values.kyc_docs.map((doc, index) => (
                      <Grid container spacing={1} key={index}>
                        <Grid item xs={10}>
                         <TextField
  select
  fullWidth
  name={`kyc_docs.${index}`}
  value={doc}
  onChange={formik.handleChange}
  label="KYC Document"
>
  
  {kycOptions.map((opt) => (
    <MenuItem key={opt.value} value={opt.value} disabled={formik.values.kyc_docs.includes(opt.value)} >
      {opt.label}
    </MenuItem>
  ))}
</TextField>

                        </Grid>
                        <Grid item xs={2}>
                          <IconButton onClick={() => remove(index)}>
                            <FiTrash2 />
                          </IconButton>
                        </Grid>
                      </Grid>
                    ))}

                    <Button
                      startIcon={<FiPlus />}
                      onClick={() => push("")}
                      variant="outlined"
                    >
                      Add KYC Document
                    </Button>
                  </Stack>
                )}
              </FieldArray>

              <Button
                type="submit"
                variant="contained"
                disabled={mutation.isPending}
              >
                Save Zone
              </Button>
            </Stack>
          </form>
        </FormikProvider>
        <Box mt={4}>
  <Typography variant="h6" mb={2}>
    Zones List
  </Typography>

  <Table>
    <TableHead>
      <TableRow>
        <TableCell>Country</TableCell>
        <TableCell>KYC Documents</TableCell>
        <TableCell align="right">Action</TableCell>
      </TableRow>
    </TableHead>

    <TableBody>
      {zones.length === 0 && (
        <TableRow>
          <TableCell colSpan={3} align="center">
            No zones created yet
          </TableCell>
        </TableRow>
      )}

      {zones.map((zone) => (
        <TableRow key={zone._id}>
          <TableCell>
            {countries.find(c => c.code === zone.country_code)?.label
              || zone.country_code}
          </TableCell>

          <TableCell>
            {zone.kyc_docs.join(", ")}
          </TableCell>

          <TableCell align="right">
            <IconButton onClick={() => handleEdit(zone)}>
              <FiEdit />
            </IconButton>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</Box>

      </CardContent>
    </Card>
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
  <DialogTitle>Edit Zone</DialogTitle>

  <DialogContent>
    <FormikProvider value={formik}>
      <form onSubmit={formik.handleSubmit}>
        <Stack spacing={3} mt={1}>
          <TextField
            select
            label="Country"
            name="country_code"
            value={formik.values.country_code}
            disabled
          >
            {countries.map((c) => (
              <MenuItem key={c.code} value={c.code}>
                {c.label}
              </MenuItem>
            ))}
          </TextField>

          
              <FieldArray name="kyc_docs">
                {({ push, remove }) => (
                  <Stack spacing={2}>
                    <Typography>KYC Documents</Typography>

                    {formik.values.kyc_docs.map((doc, index) => (
                      <Grid container spacing={1} key={index}>
                        <Grid item xs={10}>
                         <TextField
  select
  fullWidth
  name={`kyc_docs.${index}`}
  value={doc}
  onChange={formik.handleChange}
  label="KYC Document"
>
  {kycOptions.map((opt) => (
    <MenuItem key={opt.value} value={opt.value} disabled={formik.values.kyc_docs.includes(opt.value)} >
      {opt.label}
    </MenuItem>
  ))}
</TextField>

                        </Grid>
                        <Grid item xs={2}>
                          <IconButton onClick={() => remove(index)}>
                            <FiTrash2 />
                          </IconButton>
                        </Grid>
                      </Grid>
                    ))}

                    <Button
                      startIcon={<FiPlus />}
                      onClick={() => push("")}
                      variant="outlined"
                    >
                      Add KYC Document
                    </Button>
                  </Stack>
                )}
              </FieldArray>

          <Button type="submit" variant="contained">
            Update Zone
          </Button>
        </Stack>
      </form>
    </FormikProvider>
  </DialogContent>
</Dialog>

</>


      

    
  );
}
