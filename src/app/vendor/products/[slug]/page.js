import React from 'react';
import HeaderBreadcrumbs from '@/components/header-breadcrumbs';
import EditProduct from '@/components/_admin/products/edit-product';
import * as api from 'src/services';

export const revalidate = 1;

export default async function page(props) {
  const params = await props.params;
  const [data1, data2, data3, data4, data5] = await Promise.all([
    api.getAllCategories(),
    api.getAllBrandsByAdmin(),
    api.getAllSubCategories(),
    api.getAllChildCategories(),
    api.getallpoliciesforlisting(),
  ]);

  const { data: categories } = data1;
  const { data: brands } = data2;
  const { data: subCategories } = data3;
  const { data: childCategories } = data4;
  const policies = data5?.data;

  return (
    <div>
      <HeaderBreadcrumbs
        admin
        heading="Edit Product"
        links={[
          { name: 'Dashboard', href: '/vendor/dashboard' },
          { name: 'Products', href: '/vendor/products' },
          { name: 'Edit Product' },
        ]}
      />
      <EditProduct
        brands={brands}
        categories={categories}
        subCategories={subCategories}
        childCategories={childCategories}
        policies={policies}
        slug={params.slug}
        isVendor
      />
    </div>
  );
}