import React from 'react';
import PropTypes from 'prop-types';
import { fCurrency } from '@/utils/format-number';
import { FaEye } from 'react-icons/fa';
// mui
import { Box, Card, CardContent, Grid, Stack, Typography, Skeleton, Chip } from '@mui/material';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton
} from '@mui/material';




// components
ShopDetail.propTypes = {
  data: PropTypes.array.isRequired,
  isLoading: PropTypes.bool.isRequired
};
export default function ShopDetail({ data, isLoading }) {

  const [openDocs, setOpenDocs] = React.useState(false);
const [docsList, setDocsList] = React.useState([]);


  return (
    <Grid container spacing={2}>
      {data.map((v, i) => (
        <Grid key={i} size={{ md: 3, sm: 6, xs: 12 }}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Stack>
                  {/* lineHeight={1.7} */}
                  <Stack direction="row" gap={1} alignItems="center">
                    <Typography
                      variant="h4"
                    
                      sx={{
                        textDecoration: v.isDoc ? 'underline' : 'none'
                      }}
                      color="text.primary"
                    >
                      {isLoading ? (
  <Skeleton variant="text" width={80} />
                          ) : v.name === 'Total Income' || v.name === 'Total Commission' ? (
                            fCurrency(v.items)
                          ) : v.isDoc ? (
                            <IconButton
                              onClick={() => {
                                setDocsList(v.docs || []);
                                setOpenDocs(true);
                              }}
                            >
                              <FaEye />
                            </IconButton>
                          ) : (
                            v.items
                          )}

                    </Typography>
                    {v.name === 'Last Month Income' ? (
                      isLoading ? (
                        <Skeleton variant="text" width={50} />
                      ) : (
                        <Chip size="small" label="Pending" color="success" />
                      )
                    ) : (
                      ''
                    )}
                  </Stack>

                  <Typography variant="subtitle1" color="text.secondary">
                    {isLoading ? <Skeleton variant="text" width={120} /> : v.name}
                  </Typography>
                </Stack>
                {isLoading ? (
                  <Skeleton variant="circular" width={56} height={56} />
                ) : (
                  <Box
                    sx={{
                      height: 56,
                      width: 56,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: `2px solid ${v.color}`,
                      color: v.color
                    }}
                  >
                    {v.icon}
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
      ))}
      <Dialog open={openDocs} onClose={() => setOpenDocs(false)} maxWidth="md" fullWidth>
  <DialogTitle>Uploaded Documents</DialogTitle>

  <DialogContent dividers>
    <Grid container spacing={2}>
      {docsList.length === 0 ? (
        <Typography>No documents uploaded.</Typography>
      ) : (
        docsList.map((doc) => (
          <Grid item xs={12} sm={6} md={4} key={doc._id}>
            <Box
              sx={{
                border: '1px solid #eee',
                borderRadius: 2,
                p: 1,
                textAlign: 'center'
              }}
            >
              <img
                src={process.env.NEXT_PUBLIC_API_URL + doc.url}
                alt={doc.title}
                style={{ width: '100%', height: 160, objectFit: 'contain' }}
              />
              <Typography variant="subtitle2" mt={1}>
                {doc.title}
              </Typography>
            </Box>
          </Grid>
        ))
      )}
    </Grid>
  </DialogContent>
</Dialog>

    </Grid>
    
  );
}
