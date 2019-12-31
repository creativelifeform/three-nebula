import ExamplesPage from './';
import React from 'react';
import { useRouter } from 'next/router';

export default () => <ExamplesPage query={useRouter().query} />;
