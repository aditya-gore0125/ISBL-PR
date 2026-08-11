'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useMemo, useState } from 'react';

const emptyAddress = {
  fullName: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  pincode: '',
  isDefault: false,
};

function formatPrice(value) {
  return `₹${Number(value).toLocaleString('en-IN')}`;
}

function getStatusClasses(status) {
  const key = String(status || '').toLowerCase();
  const map = {
    pending: 'bg-slate-100 text-slate-700',
    confirmed: 'bg-rose-100 text-rose-700',
    packed: 'bg-yellow-100 text-yellow-700',
    shipped: 'bg-yellow-100 text-yellow-700',
    out_for_delivery: 'bg-yellow-100 text-yellow-700',
    delivered: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-red-100 text-red-700',
    returned: 'bg-red-100 text-red-700',
  };
  return map[key] || 'bg-slate-100 text-slate-700';
}

function validateAddress(address) {
  const nextErrors = {};
  if (!address.fullName.trim()) nextErrors.fullName = 'Full name is required.';
  if (!/^[6-9]\d{9}$/.test(address.phone.trim())) nextErrors.phone = 'Enter a valid 10-digit mobile number.';
  if (!address.addressLine1.trim()) nextErrors.addressLine1 = 'Address line 1 is required.';
  if (!address.city.trim()) nextErrors.city = 'City is required.';
  if (!address.state.trim()) nextErrors.state = 'State is required.';
  if (!/^[1-9][0-9]{5}$/.test(address.pincode.trim())) nextErrors.pincode = 'Enter a valid 6-digit pincode.';
  return nextErrors;
}

export default function AccountPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState({ name: '', phone: '' });
  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [profileError, setProfileError] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [addressForm, setAddressForm] = useState(emptyAddress);
  const [editingAddressIndex, setEditingAddressIndex] = useState(null);
  const [addressErrors, setAddressErrors] = useState({});
  const [addressSaving, setAddressSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = status === 'authenticated';

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login?redirect=/account');
    }
  }, [router, status]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchAccountData = async () => {
      try {
        const [accountRes, ordersRes] = await Promise.all([
          fetch('/api/account'),
          fetch('/api/orders/history'),
        ]);

        const accountData = await accountRes.json();
        const ordersData = await ordersRes.json();

        if (!accountRes.ok) {
          throw new Error(accountData?.message || 'Unable to load profile.');
        }

        setProfile({
          name: accountData.user?.name || '',
          phone: accountData.user?.phone || '',
        });
        setAddresses(accountData.user?.addresses || []);
        setOrders(ordersData.orders || []);
      } catch (error) {
        console.error('Load account error', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAccountData();
  }, [isAuthenticated]);

  const canSaveProfile = useMemo(() => profile.name.trim().length >= 2, [profile.name]);

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    if (!canSaveProfile) {
      setProfileError('Please enter your full name.');
      return;
    }

    setProfileSaving(true);
    setProfileError('');

    try {
      const response = await fetch('/api/account', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: {
            name: profile.name.trim(),
            phone: profile.phone.trim(),
          },
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || 'Unable to update profile.');
      }

      setProfile({ name: data.user.name, phone: data.user.phone || '' });
    } catch (error) {
      setProfileError(error.message || 'Unable to update profile.');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleAddressFieldChange = (field, value) => {
    setAddressForm((prev) => ({ ...prev, [field]: value }));
    setAddressErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleAddressSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validateAddress(addressForm);
    setAddressErrors(validationErrors);

    if (Object.keys(validationErrors).length) {
      return;
    }

    setAddressSaving(true);

    try {
      const nextAddresses = [...addresses];
      const sanitizedAddress = {
        ...addressForm,
        fullName: addressForm.fullName.trim(),
        phone: addressForm.phone.trim(),
        addressLine1: addressForm.addressLine1.trim(),
        addressLine2: addressForm.addressLine2.trim(),
        city: addressForm.city.trim(),
        state: addressForm.state.trim(),
        pincode: addressForm.pincode.trim(),
      };

      if (editingAddressIndex !== null) {
        nextAddresses[editingAddressIndex] = {
          ...nextAddresses[editingAddressIndex],
          ...sanitizedAddress,
        };
      } else {
        nextAddresses.push(sanitizedAddress);
      }

      const response = await fetch('/api/account', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addresses: nextAddresses }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || 'Unable to save address.');
      }

      setAddresses(data.user.addresses || nextAddresses);
      setAddressForm(emptyAddress);
      setEditingAddressIndex(null);
    } catch (error) {
      console.error('Address save error', error);
    } finally {
      setAddressSaving(false);
    }
  };

  const handleEditAddress = (address, index) => {
    setEditingAddressIndex(index);
    setAddressForm({ ...address });
    setAddressErrors({});
  };

  const handleDeleteAddress = async (index) => {
    const nextAddresses = addresses.filter((_, currentIndex) => currentIndex !== index);

    try {
      const response = await fetch('/api/account', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addresses: nextAddresses }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || 'Unable to delete address.');
      }

      setAddresses(data.user.addresses || nextAddresses);
    } catch (error) {
      console.error('Delete address error', error);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-20 text-center text-sm text-charcoal/70">
        Loading your account...
      </main>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-gold">My account</p>
        <h1 className="mt-3 font-fraunces text-4xl text-charcoal">Welcome back, {profile.name.split(' ')[0] || 'there'}</h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-[1.5rem] border border-gold/15 bg-white/90 p-6 shadow-soft">
          <h2 className="font-fraunces text-2xl text-charcoal">Profile</h2>

          <form onSubmit={handleProfileSubmit} className="mt-6 space-y-5">
            <label className="block">
              <span className="text-sm font-medium text-charcoal/80">Full name</span>
              <input
                type="text"
                value={profile.name}
                onChange={(event) => setProfile((prev) => ({ ...prev, name: event.target.value }))}
                className="mt-2 h-12 w-full rounded-[1rem] border border-gold/20 bg-ivory px-4 text-sm text-charcoal outline-none transition focus:border-gold"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-charcoal/80">Phone</span>
              <input
                type="tel"
                value={profile.phone}
                onChange={(event) => setProfile((prev) => ({ ...prev, phone: event.target.value }))}
                className="mt-2 h-12 w-full rounded-[1rem] border border-gold/20 bg-ivory px-4 text-sm text-charcoal outline-none transition focus:border-gold"
              />
            </label>

            {profileError ? <div className="rounded-[1rem] border border-maroon/20 bg-maroon/5 px-4 py-3 text-sm text-maroon">{profileError}</div> : null}

            <button
              type="submit"
              disabled={profileSaving || !canSaveProfile}
              className="w-full rounded-full bg-gold px-5 py-3 text-sm font-semibold text-white transition hover:bg-gold-dark disabled:cursor-not-allowed disabled:opacity-70"
            >
              {profileSaving ? 'Saving...' : 'Save profile'}
            </button>
          </form>
        </section>

        <section className="rounded-[1.5rem] border border-gold/15 bg-white/90 p-6 shadow-soft">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-fraunces text-2xl text-charcoal">Saved addresses</h2>
            <span className="text-xs uppercase tracking-[0.2em] text-gold">{addresses.length} saved</span>
          </div>

          <form onSubmit={handleAddressSubmit} className="mt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { label: 'Full name', field: 'fullName' },
                { label: 'Phone', field: 'phone' },
                { label: 'Address line 1', field: 'addressLine1', full: true },
                { label: 'Address line 2', field: 'addressLine2', full: true },
                { label: 'City', field: 'city' },
                { label: 'State', field: 'state' },
                { label: 'Pincode', field: 'pincode' },
              ].map((field) => (
                <label key={field.field} className={field.full ? 'sm:col-span-2' : ''}>
                  <span className="text-sm font-medium text-charcoal/80">{field.label}</span>
                  <input
                    type="text"
                    value={addressForm[field.field] || ''}
                    onChange={(event) => handleAddressFieldChange(field.field, event.target.value)}
                    className="mt-2 h-11 w-full rounded-[1rem] border border-gold/20 bg-ivory px-4 text-sm text-charcoal outline-none transition focus:border-gold"
                  />
                  {addressErrors[field.field] ? <p className="mt-1 text-xs text-maroon">{addressErrors[field.field]}</p> : null}
                </label>
              ))}
            </div>

            <div className="flex items-center gap-3 text-sm text-charcoal/75">
              <input
                type="checkbox"
                checked={addressForm.isDefault}
                onChange={(event) => handleAddressFieldChange('isDefault', event.target.checked)}
                className="h-4 w-4 rounded border-gold/20 text-gold"
              />
              <span>Set as default address</span>
            </div>

            <div className="flex gap-3">
              <button type="submit" className="rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gold-dark" disabled={addressSaving}>
                {addressSaving ? 'Saving...' : editingAddressIndex !== null ? 'Update address' : 'Add address'}
              </button>
              {editingAddressIndex !== null ? (
                <button
                  type="button"
                  onClick={() => {
                    setEditingAddressIndex(null);
                    setAddressForm(emptyAddress);
                    setAddressErrors({});
                  }}
                  className="rounded-full border border-gold/20 bg-white px-5 py-2.5 text-sm font-semibold text-charcoal transition hover:border-gold hover:text-gold-dark"
                >
                  Cancel
                </button>
              ) : null}
            </div>
          </form>

          <div className="mt-8 space-y-3">
            {addresses.length ? (
              addresses.map((address, index) => (
                <div key={`${address.fullName}-${index}`} className="rounded-[1rem] border border-gold/15 bg-ivory/60 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-semibold text-charcoal">{address.fullName}</p>
                      <p className="mt-1 text-sm leading-6 text-charcoal/70">
                        {address.addressLine1}
                        {address.addressLine2 ? `, ${address.addressLine2}` : ''}, {address.city}, {address.state} - {address.pincode}
                      </p>
                      <p className="mt-1 text-sm text-charcoal/70">{address.phone}</p>
                      {address.isDefault ? <span className="mt-2 inline-block rounded-full bg-gold/10 px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-gold-dark">Default</span> : null}
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => handleEditAddress(address, index)} className="text-sm font-semibold text-gold-dark">Edit</button>
                      <button type="button" onClick={() => handleDeleteAddress(index)} className="text-sm font-semibold text-maroon">Delete</button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[1rem] border border-dashed border-gold/20 bg-ivory/50 p-5 text-sm text-charcoal/70">
                No addresses saved yet.
              </div>
            )}
          </div>
        </section>
      </div>

      <section id="orders" className="mt-10 rounded-[1.5rem] border border-gold/15 bg-white/90 p-6 shadow-soft">
        <h2 className="font-fraunces text-2xl text-charcoal">Order history</h2>

        <div className="mt-6 space-y-4">
          {orders.length ? (
            orders.map((order) => (
              <div key={order._id} className="rounded-[1.25rem] border border-gold/15 bg-ivory/70 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-charcoal/60">Order #{String(order._id).slice(-6).toUpperCase()}</p>
                    <p className="mt-1 text-lg font-semibold text-charcoal">{formatPrice(order.totalAmount)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClasses(order.orderStatus)}`}>
                      {order.orderStatus}
                    </span>
                    <Link href={`/order-confirmation/${order._id}`} className="text-sm font-semibold text-gold-dark">
                      View details
                    </Link>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {order.items.map((item) => (
                    <div key={`${order._id}-${item.product}-${item.name}`} className="flex items-center gap-3 rounded-[1rem] bg-white/80 p-3">
                      <img src={item.image || '/hero-placeholder.svg'} alt={item.name} className="h-14 w-14 rounded-[0.8rem] object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-charcoal">{item.name}</p>
                        <p className="text-xs text-charcoal/70">Qty: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {(order.trackingId || order.courierPartner) ? (
                  <div className="mt-4 rounded-[0.9rem] border border-gold/10 bg-white/80 px-3 py-2 text-sm text-charcoal/75">
                    {order.courierPartner ? <p><span className="font-semibold">Courier:</span> {order.courierPartner}</p> : null}
                    {order.trackingId ? <p><span className="font-semibold">Tracking:</span> {order.trackingId}</p> : null}
                  </div>
                ) : null}
              </div>
            ))
          ) : (
            <div className="rounded-[1rem] border border-dashed border-gold/20 bg-ivory/50 p-5 text-sm text-charcoal/70">
              No orders yet. Start shopping to see your order history here.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
