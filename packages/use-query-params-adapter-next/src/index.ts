import { useRouter } from 'next/router';
import { useSearchParams } from 'next/navigation';
import {
  QueryParamAdapter,
  QueryParamAdapterComponent,
} from 'use-query-params';

/**
 * Adapts next/router history to work with our
 * { replace, push } interface.
 */
export const NextAdapter: QueryParamAdapterComponent = ({ children }) => {
  // implementation inspired by https://nextjs.org/docs/app/api-reference/functions/use-search-params
  const router = useRouter();
  const pathname = router.pathname;
  const searchParams = useSearchParams()!;

  const adapter: QueryParamAdapter = {
    replace(location) {
      router.replace(`${pathname}${location.search}`);
    },
    push(location) {
      router.push(`${pathname}${location.search}`);
    },
    get location() {
      const params = new URLSearchParams(searchParams);
      const search = params.toString();

      return { search };
    },
  };

  return children(adapter);
};
