import React from 'react';

// components
import HeaderBreadcrumbs from '@/components/header-breadcrumbs';
import AddProduct from '@/components/_admin/products/add-product';

// api
import * as api from 'src/services';
export const revalidate = 1;
export default async function page({ searchParams }) {
   const sp = await searchParams;

  const data1 = await api.getAllCategories();
  const data2 = await api.getAllBrandsByAdmin();
  const data3 = await api.getAllSubCategories();
  const data4 = await api.getAllChildCategories();
  const data5 = await api.getallpoliciesforlisting();

   if (!data1 || !data2 || !data3 || !data4) {
    notFound();
  }
  const { data: categories } = data1;
  const { data: brands } = data2;

  const { data: subCategories } = data3;
const { data: childCategories } = data4;


const policies = data5?.data;

  const prefill = {
    title: sp?.title || '',
    condition: sp?.condition || '',
    categoryId: sp?.category || '',
  };

console.log('POLICIES FROM API =>', brands);


  return (
    <div>
      <HeaderBreadcrumbs
        admin
        heading="Add Product"
        links={[
          {
            name: 'Dashboard',
            href: '/vendor/dashboard'
          },
          {
            name: 'Products',
            href: '/vendor/products'
          },
          {
            name: 'Add Product'
          }
        ]}
      />
      <AddProduct brands={brands} categories={categories}  subCategories={subCategories}
  childCategories={childCategories} policies={policies}    prefill={prefill} isVendor/>
    </div>
  );
}
