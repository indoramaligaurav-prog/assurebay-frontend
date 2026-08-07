import { Card, CardContent, Typography, Box } from '@mui/material';
import React from 'react';

export default function ProductContentCard({ content, name }) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h4" color="text.primary" gutterBottom>
          About {name}
        </Typography>
        <Box
          sx={{
            '& h1, & h2, & h3, & h4, & h5, & h6': {
              color: 'text.primary',
              marginBottom: 1
            },
            '& p, & span, & li': {
              color: 'text.secondary'
            }
          }}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </CardContent>
    </Card>
  );
}
