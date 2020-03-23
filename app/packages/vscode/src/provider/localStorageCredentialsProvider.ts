class LocalStorageCredentialsProvider {

	static readonly CREDENTIALS_OPENED_KEY = 'credentials.provider';

	private _credentials: any;
	private get credentials(): any [] {
		if (!this._credentials) {
			try {
				const serializedCredentials = window.localStorage.getItem(LocalStorageCredentialsProvider.CREDENTIALS_OPENED_KEY);
				if (serializedCredentials) {
					this._credentials = JSON.parse(serializedCredentials);
				}
			} catch (error) {
				// ignore
			}

			if (!Array.isArray(this._credentials)) {
				this._credentials = [];
			}
		}

		return this._credentials;
	}

	private save(): void {
		window.localStorage.setItem(LocalStorageCredentialsProvider.CREDENTIALS_OPENED_KEY, JSON.stringify(this.credentials));
	}

	async getPassword(service: string, account: string): Promise<string | null> {
		return this.doGetPassword(service, account);
	}

	private async doGetPassword(service: string, account?: string): Promise<string | null> {
		for (const credential of this.credentials) {
			if (credential.service === service) {
				if (typeof account !== 'string' || account === credential.account) {
					return credential.password;
				}
			}
		}

		return null;
	}

	async setPassword(service: string, account: string, password: string): Promise<void> {
		this.deletePassword(service, account);

		this.credentials.push({ service, account, password });

		this.save();
	}

	async deletePassword(service: string, account: string): Promise<boolean> {
		let found = false;

		this._credentials = this.credentials.filter(credential => {
			if (credential.service === service && credential.account === account) {
				found = true;

				return false;
			}

			return true;
		});

		if (found) {
			this.save();
		}

		return found;
	}

	async findPassword(service: string): Promise<string | null> {
		return this.doGetPassword(service);
	}

	async findCredentials(service: string): Promise<Array<{ account: string, password: string }>> {
		return this.credentials
			.filter(credential => credential.service === service)
			.map(({ account, password }) => ({ account, password }));
	}
}