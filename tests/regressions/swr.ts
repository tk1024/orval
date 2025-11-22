import {
  useListPets,
  useListPetsInfinite,
} from '../generated/swr/petstore-override-swr/endpoints';

export const useInfiniteQueryTest = () => {
  const { data } = useListPetsInfinite(
    {
      sort: 'name',
    },
    {
      swr: {
        initialSize: 2,
      },
    },
  );

  // Test that pageParams has correct type (ListPetsParams)
  // SWR Infinite data is an array of pages
  const pages = data?.flatMap((page) => {
    if ('data' in page && page.status === 200) {
      return page.data.map((pet) => pet.name);
    }
    return [];
  });

  return pages;
};

export const useHookTest = () => {
  const { data } = useListPets(
    {
      sort: 'name',
    },
    {
      swr: {
        dedupingInterval: 5000,
      },
    },
  );

  // Test that data is correctly typed
  if (data && 'data' in data && data.status === 200) {
    const names = data.data.map((pet) => pet.name);
    return names;
  }

  return undefined;
};
