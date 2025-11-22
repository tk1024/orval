import {
  getListPetsInfiniteKeyLoader,
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

// Test that swrKeyLoader has correct type signature
// It should be a function that accepts (pageIndex, previousPageData) and returns a key
export const testSwrKeyLoaderType = () => {
  const keyLoader = getListPetsInfiniteKeyLoader({ sort: 'name' });

  // keyLoader should be callable with (number, previousPageData)
  // For the first page, previousPageData can be null/undefined
  const firstKey = keyLoader(0, undefined as any);
  // firstKey should be an array (the SWR key)
  const isArray = Array.isArray(firstKey);

  // When previousPageData exists but has no data, should return null
  const emptyResponse = {
    data: [],
    status: 200,
    headers: new Headers(),
  } as const;
  const shouldBeNull = keyLoader(1, emptyResponse as any);

  return { isArray, shouldBeNull };
};
