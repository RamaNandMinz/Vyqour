import { render, waitFor } from '@testing-library/react';
import { NewArrivals } from './NewArrivals';

describe('NewArrivals component', () => {
  it('renders loading state while fetching', async () => {
    const { getByText } = render(<NewArrivals />);
    expect(getByText('Loading...')).toBeInTheDocument();
  });

  it('renders no products message if no products are found', async () => {
    const { getByText } = render(<NewArrivals />);
    expect(getByText('No new arrivals found')).toBeInTheDocument();
  });

  it('renders products grid with 8 products', async () => {
    const { getByText, getByRole } = render(<NewArrivals />);
    await waitFor(() => getByRole('grid'));
    const products = await getByRole('grid').querySelectorAll('div');
    expect(products).toHaveLength(8);
  });
});