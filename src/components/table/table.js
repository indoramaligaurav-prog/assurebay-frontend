'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from '@bprogress/next';
import { useSearchParams } from 'next/navigation';
import PropTypes from 'prop-types';

// mui
import {
  Divider,
  Card,
  Table,
  TableBody,
  TableContainer,
  Stack,
  InputLabel,
  MenuItem,
  FormControl,
  Select
} from '@mui/material';

// components
import NotFound from '@/illustrations/data-not-found';
import Pagination from 'src/components/pagination';
import Search from 'src/components/search';
import TableHead from './table-head';

// ----------------------------------------------------------------------

CustomTable.propTypes = {
  headData: PropTypes.array.isRequired,
  data: PropTypes.shape({
    data: PropTypes.array,
    page: PropTypes.number,
    totalPages: PropTypes.number
  }),
  isLoading: PropTypes.bool,
  row: PropTypes.elementType.isRequired,
  filters: PropTypes.array,
  isSearch: PropTypes.bool
};

export default function CustomTable({
  headData,
  data,
  isLoading = false,
  isSearch = false,
  row,
  filters = [],
  ...rest
}) {
  const { replace } = useRouter();
  const searchParams = useSearchParams();

  const Component = row;

  // --------------------------
  // State
  // --------------------------

  const [state, setState] = useState({});

  // Sync URL params → state (only once)
  useEffect(() => {
    const paramsObject = {};
    searchParams.forEach((value, key) => {
      paramsObject[key] = value;
    });
    setState(paramsObject);
  }, [searchParams]);

  // --------------------------
  // Handle Filter Change
  // --------------------------

  const handleChange = (param, val) => {
    const params = new URLSearchParams(searchParams);

    if (!val) {
      params.delete(param);
    } else {
      params.set(param, val);
    }

    replace(`?${params.toString()}`);
  };

  // --------------------------
  // Safe Data Handling
  // --------------------------

  const tableData = useMemo(() => {
    if (isLoading) return Array.from({ length: 6 });
    return Array.isArray(data?.data) ? data.data : [];
  }, [isLoading, data]);

  const isEmpty = !isLoading && tableData.length === 0;

  // --------------------------
  // Render
  // --------------------------

  return (
    <Card>
      {/* Search + Filters */}
      {(isSearch || filters.length > 0) && (
        <Stack
          spacing={2}
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ p: 2 }}
        >
          {isSearch && <Search />}

          {filters.length > 0 && (
            <Stack spacing={2} direction="row">
              {filters.map((item) => (
                <FormControl
                  key={item.param}
                  sx={{ maxWidth: 200, minWidth: 140, width: '100%' }}
                >
                  <InputLabel id={`select-${item.param}`}>
                    {item.name}
                  </InputLabel>

                  <Select
                    labelId={`select-${item.param}`}
                    value={state[item.param] ?? ''}
                    label={item.name}
                    onChange={(e) =>
                      handleChange(item.param, e.target.value)
                    }
                  >
                    <MenuItem value="">None</MenuItem>

                    {item.data?.map((v) => (
                      <MenuItem key={v.slug} value={v.slug}>
                        {v.name || v.title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ))}
            </Stack>
          )}
        </Stack>
      )}

      {/* Empty State */}
      {isEmpty ? (
        <>
          <Divider />
          <NotFound title="No Data Found" />
        </>
      ) : (
        <>
          <TableContainer>
            <Table size="small" sx={{ minWidth: 650 }}>
              <TableHead headData={headData} />

              <TableBody>
                {tableData.map((item, index) => (
                  <Component
                    key={item?.id ?? index}
                    row={item}
                    index={index}
                    isLoading={isLoading}
                    {...rest}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Divider />

          {!isLoading && data?.totalPages > 1 && (
            <Pagination
              data={data}
              sx={{ my: 2 }}
            />
          )}
        </>
      )}
    </Card>
  );
}
