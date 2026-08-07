// react
import React from 'react';

// mui
import { Typography, Grid, Box, Stack, Container } from '@mui/material';

// component
import CategoryCard from 'src/components/cards/category';
export default function Categories(props) {
  const { data, isHome } = props;
  return (
    <Container maxWidth="xl">
      <Stack gap={3}>
        {isHome && (
          <Stack>
            <Typography variant="h3" color="text.primary">
              Categories
            </Typography>
            <Typography variant="body1" sx={{
    fontSize: "14px",   // fixed size
    color: "text.secondary"
  }} color="text.secondary">
              Discover our most popular categories, carefully curated to help you find the best products quickly and
              easily.
            </Typography>
          </Stack>
        )}

        <Box>
          <Grid container spacing={2} alignItems="center">
            {data.map((inner) => (
              <React.Fragment key={Math.random()}>
                <Grid size={{ lg: 2, md: 3, sm: 4, xs: 4 }}>
                  <CategoryCard category={inner} slug={props.slug} />
                </Grid>
              </React.Fragment>
            ))}
            {isHome && !Boolean(data.length) && (
              <Typography variant="h3" color="error.main" textAlign="center">
                Categories not found
              </Typography>
            )}
          </Grid>
        </Box>
      </Stack>
    </Container>
  );
}
