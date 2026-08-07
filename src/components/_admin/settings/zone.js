'use client';
import React from 'react';
import * as api from 'src/services';
import { useQuery } from '@tanstack/react-query';
import ZoneSettingsForm from '@/components/forms/settings/admin-zone';
import { useMutation } from "@tanstack/react-query";

import { useSelector } from "react-redux";

export default function ZoneMain() {
    
     const { user } = useSelector((state) => state.user);

  const { data, isPending: isLoading } = useQuery({
    queryKey: ['zone-settings'],
    queryFn: () => api.getzonsByAdmin()
  });

  return <ZoneSettingsForm data={data?.data} isLoading={isLoading} />;
}