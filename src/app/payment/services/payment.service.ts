import { generateMnemonic } from 'bip39';
import { encryptPGP } from '../../crypto/services/utilspgp';
import httpService from '../../core/services/http.service';
import envService from '../../core/services/env.service';
import { LifetimeTier, StripeSessionMode } from '../types';
import { Workspace } from '../../core/types';
import { loadStripe, RedirectToCheckoutServerOptions, Stripe, StripeError } from '@stripe/stripe-js';

export interface CreatePaymentSessionPayload {
  test?: boolean;
  lifetime_tier?: LifetimeTier;
  mode: StripeSessionMode;
  priceId: string;
  successUrl?: string;
  canceledUrl?: string;
}

export interface CreateTeamsPaymentSessionPayload {
  test?: boolean;
  mode: StripeSessionMode;
  priceId: string;
  quantity: number;
  mnemonicTeam: string;
  successUrl?: string;
  canceledUrl?: string;
}

let stripe: Stripe;

async function getStripe() {
  if (!stripe) {
    stripe = (await loadStripe(
      envService.isProduction() ? process.env.REACT_APP_STRIPE_PK : process.env.REACT_APP_STRIPE_TEST_PK,
    )) as Stripe;
  }

  return stripe;
}

const paymentService = {
  async createSession(body: CreatePaymentSessionPayload): Promise<{ id: string }> {
    const response = await httpService.post<CreatePaymentSessionPayload, { id: string }>(
      `${process.env.REACT_APP_API_URL}/api/v2/stripe/session`,
      body,
      {
        authWorkspace: Workspace.Individuals,
      },
    );

    return response;
  },

  async redirectToCheckout(options: RedirectToCheckoutServerOptions): Promise<{ error: StripeError }> {
    const stripe = await getStripe();

    return stripe.redirectToCheckout(options);
  },

  // TODO: refactor as individual
  async handlePaymentTeams(priceId: string, quantity: number, mode: StripeSessionMode): Promise<void> {
    const mnemonicTeam = generateMnemonic(256);
    const encMnemonicTeam = await encryptPGP(mnemonicTeam);
    const codMnemonicTeam = Buffer.from(encMnemonicTeam.data).toString('base64');
    const payload: CreateTeamsPaymentSessionPayload = {
      mode,
      priceId,
      quantity,
      mnemonicTeam: codMnemonicTeam,
      test: !envService.isProduction(),
    };

    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/stripe/teams/session`, {
      method: 'POST',
      headers: httpService.getHeaders(true, false),
      body: JSON.stringify(payload),
    })
      .then((response) => response.json())
      .catch((err) => {
        console.error('Error starting Stripe session. Reason: %s', err);
        throw err;
      });

    if (response.error) {
      throw Error(response.error);
    }

    const stripe = await getStripe();

    await stripe.redirectToCheckout({ sessionId: response.id });
  },
};

export default paymentService;