// app/admin/products/edit/[id]/page.js
import HeaderBreadcrumbs from '@/components/header-breadcrumbs';
import EditProduct from '@/components/_admin/products/edit-product';
import * as api from 'src/services';

export const dynamic = 'force-dynamic';

export default async function Page({ params }) {
const { id } = await params;

  const { data: categories } = await api.getAllCategories();
  const { data: brands } = await api.getAllBrandsByAdmin();
  const { data: shops } = await api.getAllShopsByAdmin();
  const { data: attributes } = await api.getAllAttributesByAdmin();
  const { data: policies } = await api.getallpoliciesforlisting();

  return (
    <>
      <HeaderBreadcrumbs
        admin
        heading="Edit Product"
        links={[
          { name: 'Dashboard', href: '/admin/dashboard' },
          { name: 'Products', href: '/admin/products' },
          { name: 'Edit Product' }
        ]}
      />

      <EditProduct
        id={id}
        categories={categories}
        brands={brands}
        shops={shops}
        attributes={attributes}
        policies={policies}
      />
    </>
  );
}
