(async () => {
    const wasm = await WebAssembly.instantiateStreaming(fetch("web.wasm"));
    const { generate_id } = wasm.instance.exports;

    // Fetch the list of groups
    const fetchGroups = async () => {
        try {
            const response = await fetch('/groups');
            if (response.ok) {
                const data = await response.json();
                console.log('Fetched groups:', data);
                return data.obj; // The actual array of groups is in the `obj` property
            } else {
                console.error('Failed to fetch groups');
                return [];
            }
        } catch (error) {
            console.error('Error fetching groups:', error);
            return [];
        }
    };

    const populateGroupDropdown = (groups) => {
        const groupSelect = document.getElementById('group-id') as HTMLSelectElement;
        groups.forEach(group => {
            const option = document.createElement('option');
            option.value = group.id.toString();
            option.textContent = group.remark; // Use `remark` as the group name
            groupSelect.appendChild(option);
        });
    };

    const groups = await fetchGroups();
    populateGroupDropdown(groups);

    document.getElementById('registration-form').addEventListener('submit', async (event) => {
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
            } else {
                console.error('Error registering user');
            }
        } catch (error) {
            console.error('Network error:', error);
        }
    });
})();
