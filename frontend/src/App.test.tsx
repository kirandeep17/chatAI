import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { setupServer } from 'msw/node';
import { App } from './App';
import { clearToken } from './auth/token';
import { handlers } from './mocks/handlers';

const server = setupServer(...handlers);
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterAll(() => server.close());
beforeEach(() => {
  clearToken();
  window.history.replaceState(null, '', '/');
});

async function signIn(user: ReturnType<typeof userEvent.setup>, token = 'demo-token') {
  await user.type(await screen.findByLabelText('Bearer token'), token);
  await user.click(screen.getByRole('button', { name: 'Continue' }));
}

test('UI stays locked until a valid token is pasted', async () => {
  const user = userEvent.setup();
  render(<App />);

  await signIn(user, 'not-a-real-token');
  expect(await screen.findByRole('alert')).toHaveTextContent('invalid or has expired');
  expect(screen.queryByRole('navigation', { name: 'Products' })).not.toBeInTheDocument();

  await user.clear(screen.getByLabelText('Bearer token'));
  await signIn(user);
  expect(await screen.findByRole('navigation', { name: 'Products' })).toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: 'Sign out' }));
  expect(await screen.findByLabelText('Bearer token')).toBeInTheDocument();
});

test('pick client, open a product, chat and see the streamed answer', async () => {
  const user = userEvent.setup();
  render(<App />);
  await signIn(user);

  // Rail: the client's products. List pane: client on top, user at the bottom.
  expect(await screen.findByRole('button', { name: /ACME Corp/ })).toBeInTheDocument();
  expect(screen.getByText('Jane Doe')).toBeInTheDocument();
  const products = screen.getByRole('navigation', { name: 'Products' });

  // Selecting a product opens a new chat window for it and lists its existing chats.
  await user.click(within(products).getByRole('link', { name: 'Payments' }));
  expect(await screen.findByText('What can I help you with?')).toBeInTheDocument();
  const chats = screen.getByRole('region', { name: 'Payments chats' });
  expect(await within(chats).findByText('Q3 chargeback summary')).toBeInTheDocument();

  // Search filters the list.
  await user.type(screen.getByLabelText('Search chats'), 'fee');
  expect(within(chats).queryByText('Q3 chargeback summary')).not.toBeInTheDocument();
  await user.clear(screen.getByLabelText('Search chats'));

  await user.type(screen.getByLabelText('Message'), 'How many chargebacks?{Enter}');
  expect(await screen.findByText('How many chargebacks?', { selector: '.msg__bubble' })).toBeInTheDocument();
  expect(await screen.findByText(/mocked response/, {}, { timeout: 5000 })).toBeInTheDocument();
  expect(await screen.findByText('[1] Product runbook')).toBeInTheDocument();

  // The new chat shows up in the product's list with its title from the first message.
  expect(await within(chats).findByText('How many chargebacks?')).toBeInTheDocument();
});

test('switching client changes the product list', async () => {
  const user = userEvent.setup();
  render(<App />);
  await signIn(user);
  await user.click(await screen.findByRole('button', { name: /ACME Corp/ }));
  await user.click(screen.getByRole('option', { name: /Globex/ }));
  const products = screen.getByRole('navigation', { name: 'Products' });
  expect(within(products).getByText('Treasury')).toBeInTheDocument();
  expect(within(products).queryByText('Payments')).not.toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Globex' })).toBeInTheDocument();
});
