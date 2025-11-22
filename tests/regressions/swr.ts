import {
  getListPetsInfiniteKeyLoader,
  type listPetsResponse,
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

  return;
};

// Test that swrKeyLoader has correct type signature
// It should be a function that accepts (pageIndex, previousPageData) and returns a key
export const testSwrKeyLoaderType = () => {
  const keyLoader = getListPetsInfiniteKeyLoader({ sort: 'name' });

  type KeyLoaderParam = Parameters<
    ReturnType<typeof getListPetsInfiniteKeyLoader>
  >[1];

  // keyLoader should be callable with (number, previousPageData)
  // For the first page, previousPageData can be null/undefined
  const firstKey = keyLoader(0, undefined as unknown as KeyLoaderParam);
  // firstKey should be an array (the SWR key)
  const isArray = Array.isArray(firstKey);

  // When previousPageData exists but has no data, should return null
  const emptyResponse: listPetsResponse = {
    data: [],
    status: 200,
    headers: new Headers(),
  };
  const shouldBeNull = keyLoader(1, emptyResponse);

  return { isArray, shouldBeNull };
};

// Test pagination termination for all three response patterns
export const testPaginationTermination = () => {
  const keyLoader = getListPetsInfiniteKeyLoader({ sort: 'name' });

  type KeyLoaderParam = Awaited<
    ReturnType<
      typeof import('../generated/swr/petstore-override-swr/endpoints').listPets
    >
  >;

  // Case 1: Direct array response (e.g., Pet[])
  // Note: This tests the generated logic's ability to handle array responses,
  // even though listPets doesn't return arrays directly
  const emptyArrayResponse = [] as unknown as KeyLoaderParam;
  const shouldBeNull1 = keyLoader(1, emptyArrayResponse);

  const arrayWithItems = [
    { id: 1, name: 'Fluffy' },
  ] as unknown as KeyLoaderParam;
  const shouldContinue1 = keyLoader(1, arrayWithItems);

  // Case 2: Wrapped response with data array (e.g., { data: Pet[], status: 200 })
  // This is the actual response type for listPets
  const emptyDataResponse: listPetsResponse = {
    data: [],
    status: 200,
    headers: new Headers(),
  };
  const shouldBeNull2 = keyLoader(1, emptyDataResponse);

  const dataWithItems: listPetsResponse = {
    data: [{ id: 1, name: 'Fluffy', type: 'cat' }],
    status: 200,
    headers: new Headers(),
  };
  const shouldContinue2 = keyLoader(1, dataWithItems);

  // Case 3: Single object response (e.g., Pet, QueuedTask)
  // Note: This tests the generated logic's ability to handle single object responses,
  // even though listPets doesn't return single objects
  const singleObjectResponse = {
    id: 1,
    name: 'Fluffy',
  } as unknown as KeyLoaderParam;
  const shouldBeNull3 = keyLoader(1, singleObjectResponse);

  return {
    case1_empty: shouldBeNull1,
    case1_withItems: shouldContinue1,
    case2_empty: shouldBeNull2,
    case2_withItems: shouldContinue2,
    case3_singleObject: shouldBeNull3,
  };
};
