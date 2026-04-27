<script setup lang="ts">
import { computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useQuery } from '@tanstack/vue-query';
import { z } from 'zod';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import Button from '@/components/ui/Button.vue';
import Input from '@/components/ui/Input.vue';
import { productService } from '../services/product.service';
import { productMutations } from '../hooks/product.mutations';

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  sku: z.string().min(1, 'SKU is required'),
  category: z.string().min(1, 'Category is required'),
  price: z.number().min(0, 'Invalid price'),
  stock: z.number().int().min(0, 'Invalid stock'),
  description: z.string().min(1, 'Description is required')
});

type ProductForm = z.infer<typeof productSchema>;

const router = useRouter();
const route = useRoute();
const id = route.params.id as string;
const isEditing = computed(() => Boolean(id && id !== 'new'));

const { data: product, isLoading: isLoadingProduct } = useQuery({
  queryKey: computed(() => ['product', id]),
  queryFn: () => productService.getProduct(id),
  enabled: isEditing
});

const { handleSubmit, resetForm, defineField, errors } = useForm<ProductForm>({
  validationSchema: toTypedSchema(productSchema),
  initialValues: {
    name: '',
    sku: '',
    category: '',
    price: 0,
    stock: 0,
    description: ''
  }
});

const [name, nameProps] = defineField('name');
const [sku, skuProps] = defineField('sku');
const [category, categoryProps] = defineField('category');
const [price, priceProps] = defineField('price');
const [stock, stockProps] = defineField('stock');
const [description, descriptionProps] = defineField('description');

watch(
  product,
  (newProduct) => {
    if (newProduct) {
      resetForm({
        values: {
          name: newProduct.name,
          sku: newProduct.sku,
          category: newProduct.category,
          price: newProduct.price,
          stock: newProduct.stock,
          description: newProduct.description
        }
      });
    }
  },
  { immediate: true }
);

const mutation = productMutations.useSave(isEditing.value, id, {
  onSuccess: () => {
    router.push('/products');
  }
});

const onSubmit = handleSubmit((data) => {
  mutation.mutate(data);
});
</script>

<template>
  <div v-if="isEditing && isLoadingProduct" class="p-8 text-center text-gray-500">
    Loading product data...
  </div>

  <div v-else class="overflow-y-auto flex-1 pb-8">
    <div
      class="max-w-2xl mx-auto space-y-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200"
    >
      <div class="flex items-center justify-between border-b border-gray-200 pb-4">
        <h1 class="text-xl font-bold text-gray-900">
          {{ isEditing ? 'Edit Product' : 'New Product' }}
        </h1>
        <Button variant="ghost" @click="router.push('/products')"> Cancel </Button>
      </div>

      <form @submit="onSubmit" class="space-y-4">
        <Input
          label="Name"
          v-bind="nameProps"
          v-model="name"
          :error="errors.name"
          placeholder="Product Name"
        />

        <div class="grid grid-cols-2 gap-4">
          <Input
            label="SKU"
            v-bind="skuProps"
            v-model="sku"
            :error="errors.sku"
            placeholder="SKU-123"
          />

          <Input
            label="Category"
            v-bind="categoryProps"
            v-model="category"
            :error="errors.category"
            placeholder="Category"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <Input
            label="Price"
            type="number"
            step="0.01"
            v-bind="priceProps"
            v-model.number="price"
            :error="errors.price"
            placeholder="0.00"
          />

          <Input
            label="Stock"
            type="number"
            v-bind="stockProps"
            v-model.number="stock"
            :error="errors.stock"
            placeholder="0"
          />
        </div>

        <Input
          label="Description"
          v-bind="descriptionProps"
          v-model="description"
          :error="errors.description"
          placeholder="Product description"
        />

        <div class="pt-4 flex justify-end space-x-3">
          <Button type="button" variant="secondary" @click="router.push('/products')">
            Cancel
          </Button>
          <Button type="submit" :disabled="mutation.isPending.value">
            {{ mutation.isPending.value ? 'Saving...' : 'Save Product' }}
          </Button>
        </div>
      </form>
    </div>
  </div>
</template>
