(async () => {
    const response = await fetch("web.wasm");
    const buffer = await response.arrayBuffer();
    const wasm = await WebAssembly.instantiate(buffer);
    const { generate_id, generate_package_id } = wasm.instance.exports as {
        generate_id: () => string;
        generate_package_id: () => number;
    };

    interface Group {
        id: number;
        remark: string;
    }

    interface Client {
        id: string;
        email: string;
    }

    interface Traffic {
        up: number;
        down: number;
    }

    const fetchGroups = async (): Promise<Group[]> => {
        try {
            const response = await fetch('/groups');
            if (response.ok) {
                const data = await response.json();
                console.log('Fetched groups:', data);
                return data.obj;
            } else {
                console.error('Failed to fetch groups');
                return [];
            }
        } catch (error) {
            console.error('Error fetching groups:', error);
            return [];
        }
    };

    const fetchClients = async (inboundId: number): Promise<Client[]> => {
        try {
            const response = await fetch(`/clients/${inboundId}`);
            if (response.ok) {
                const data = await response.json();
                console.log(`Fetched clients for inbound ${inboundId}:`, data);
                const settings = JSON.parse(data.obj.settings);
                return settings.clients;
            } else {
                console.error(`Failed to fetch clients for inbound ${inboundId}`);
                return [];
            }
        } catch (error) {
            console.error(`Error fetching clients for inbound ${inboundId}:`, error);
            return [];
        }
    };

    const fetchClientTraffic = async (clientId: string): Promise<Traffic | null> => {
        try {
            const response = await fetch(`/clientTraffic/${clientId}`);
            if (response.ok) {
                const data = await response.json();
                console.log(`Fetched traffic for client ${clientId}:`, data);
                if (data.obj.length > 0) {
                    return data.obj[0];
                } else {
                    return null;
                }
            } else {
                console.error(`Failed to fetch traffic for client ${clientId}`);
                return null;
            }
        } catch (error) {
            console.error(`Error fetching traffic for client ${clientId}:`, error);
            return null;
        }
    };

    const populateGroupDropdown = (groups: Group[]) => {
        const groupSelect = document.getElementById('group-id') as HTMLSelectElement;
        groups.forEach((group) => {
            const option = document.createElement('option');
            option.value = group.id.toString();
            option.textContent = group.remark;
            groupSelect.appendChild(option);
        });
    };

    const displayDashboard = async (groups: Group[]) => {
        const dashboard = document.getElementById('dashboard') as HTMLDivElement;
        dashboard.innerHTML = '';

        for (const group of groups) {
            const groupDiv = document.createElement('div');
            groupDiv.className = 'group';
            groupDiv.innerHTML = `<h2>${group.remark} (ID: ${group.id})</h2>`;

            const clients = await fetchClients(group.id);
            if (clients.length > 0) {
                const clientList = document.createElement('ul');
                for (const client of clients) {
                    const clientItem = document.createElement('li');
                    const traffic = await fetchClientTraffic(client.id);
                    if (traffic) {
                        clientItem.innerHTML = `${client.email} - Up: ${traffic.up} Down: ${traffic.down}`;
                    } else {
                        clientItem.innerHTML = `${client.email} - No traffic data`;
                    }
                    clientList.appendChild(clientItem);
                }
                groupDiv.appendChild(clientList);
            } else {
                groupDiv.innerHTML += '<p>No clients found</p>';
            }

            dashboard.appendChild(groupDiv);
        }
    };

    const updateDashboard = async () => {
        const groups = await fetchGroups();
        displayDashboard(groups);
    };

    const groups = await fetchGroups();
    populateGroupDropdown(groups);
    displayDashboard(groups);

    const form = document.getElementById('registration-form');
    if (form) {
        form.addEventListener('submit', async (event) => {
            event.preventDefault();

            const username = (document.getElementById('username') as HTMLInputElement).value;
            const packageId = (document.getElementById('package-id') as HTMLSelectElement).value;
            const email = (document.getElementById('email') as HTMLInputElement).value;
            const totalGB = (document.getElementById('total-gb') as HTMLInputElement).value;
            const expiryTime = (document.getElementById('expiry-time') as HTMLInputElement).value;
            const enable = (document.getElementById('enable') as HTMLInputElement).checked;
            const groupId = (document.getElementById('group-id') as HTMLSelectElement).value;

            if (!packageId || !groupId) {
                alert('Please select a package ID and group ID');
                return;
            }

            const id = generate_id();
            console.log("WASM: Test ID", id);

            const package_id = generate_package_id();
            console.log("WASM: Test Package ID", package_id);

            const userData = {
                username,
                packageId: parseInt(packageId),
                email,
                totalGB: parseInt(totalGB),
                expiryTime: parseInt(expiryTime),
                enable,
                groupId: parseInt(groupId)
            };

            try {
                const response = await fetch('/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(userData)
                });

                if (response.ok) {
                    console.log('User registered successfully');
                    updateDashboard();
                } else {
                    console.error('Error registering user');
                }
            } catch (error) {
                console.error('Network error:', error);
            }
        });
    }

    // Update the dashboard every 30 seconds
    setInterval(updateDashboard, 30000);
})();
