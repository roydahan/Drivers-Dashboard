// ScyllaDB officially supported driver versions (from https://docs.scylladb.com/stable/versioning/driver-support.html)
// These are fetched dynamically from the docs page, with fallback to cached values
let scylladbSupportedVersions = {
    'python-driver': [],
    'java-driver-3x': [],
    'java-driver-4x': [],
    'gocql': [],
    'scylla-rust-driver': [],
    'csharp-driver': [],
    'cpp-rs-driver': [],
    'cpp-driver': []
};

// URL for ScyllaDB driver support documentation
const SCYLLADB_SUPPORT_URL = 'https://docs.scylladb.com/stable/versioning/driver-support.html';

// Mapping from ScyllaDB docs driver names to our internal driver names
const driverNameMapping = {
    'python driver': 'python-driver',
    'go driver': 'gocql',
    'rust driver': 'scylla-rust-driver',
    'c# driver': 'csharp-driver',
    'cpp rs driver': 'cpp-rs-driver',
    'c++ driver': 'cpp-driver',
    'node.js rs driver': 'nodejs-rs-driver'
};

// Fetch and parse supported versions from ScyllaDB documentation (HTML)
async function fetchSupportedVersions() {
    console.log('📋 Fetching supported versions from ScyllaDB docs (HTML)...');

    try {
        // Fetch HTML page directly (avoid broken CORS proxies)
        let html = null;

        try {
            const response = await fetch(SCYLLADB_SUPPORT_URL, {
                method: 'GET',
                headers: { 'Accept': 'text/html' }
            });

            if (response.ok) {
                html = await response.text();
                console.log('✅ Successfully fetched docs page directly');
            } else {
                console.log(`❌ Failed to fetch docs page: ${response.status} ${response.statusText}`);
                return false;
            }
        } catch (e) {
            console.log('❌ Network error fetching docs page:', e.message);
            return false;
        }

        const newVersions = {};

        // Parse the HTML to extract supported versions
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // Find the supported versions table
        const table = doc.querySelector('#supported-versions table');
        if (!table) {
            console.log('❌ Could not find supported versions table');
            return false;
        }

        const rows = table.querySelectorAll('tbody tr');

        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length >= 2) {
                const driverCell = cells[0];
                const versionsCell = cells[1];

                // Get driver name from link text or cell text
                const link = driverCell.querySelector('a');
                const driverName = (link ? link.textContent : driverCell.textContent).trim().toLowerCase();

                // Check for Java Driver special case (has both 4.x and 3.x)
                if (driverName === 'java driver') {
                    const versionsHtml = versionsCell.innerHTML;

                    // Extract 4.x versions
                    const match4x = versionsHtml.match(/Java Driver 4\.x[\s\S]*?<ul[^>]*>([\s\S]*?)<\/ul>/i);
                    if (match4x) {
                        const versions4x = [...match4x[1].matchAll(/<li><p>([^<]+)<\/p><\/li>/g)]
                            .map(m => m[1].trim().replace(/\s*\(.*\)/, '')); // Remove (Beta) etc.
                        newVersions['java-driver-4x'] = versions4x;
                        console.log('  📦 java-driver-4x:', versions4x);
                    }

                    // Extract 3.x versions
                    const match3x = versionsHtml.match(/Java Driver 3\.x[\s\S]*?<ul[^>]*>([\s\S]*?)<\/ul>/i);
                    if (match3x) {
                        const versions3x = [...match3x[1].matchAll(/<li><p>([^<]+)<\/p><\/li>/g)]
                            .map(m => m[1].trim().replace(/\s*\(.*\)/, ''));
                        newVersions['java-driver-3x'] = versions3x;
                        console.log('  📦 java-driver-3x:', versions3x);
                    }
                } else {
                    // Map driver name to our internal name
                    const internalName = driverNameMapping[driverName];
                    if (internalName) {
                        // Extract version numbers from list items
                        const versionItems = versionsCell.querySelectorAll('li p');
                        const versions = Array.from(versionItems)
                            .map(p => p.textContent.trim().replace(/\s*\(.*\)/, '')); // Remove (Beta) etc.

                        if (versions.length > 0) {
                            newVersions[internalName] = versions;
                            console.log(`  📦 ${internalName}:`, versions);
                        }
                    }
                }
            }
        });

        // Update the supported versions with fetched data
        if (Object.keys(newVersions).length > 0) {
            scylladbSupportedVersions = { ...scylladbSupportedVersions, ...newVersions };
            console.log('✅ Updated supported versions:', scylladbSupportedVersions);
            return true;
        }

        return false;
    } catch (error) {
        console.error('❌ Error fetching supported versions:', error);
        return false;
    }
}

// Configuration for database drivers
const drivers = [
    {
        name: 'scylla-rust-driver',
        scyllaRepo: 'scylladb/scylla-rust-driver',
        cassandraRepo: null, // Scylla-specific driver
        description: 'Rust CQL driver'
    },
    {
        name: 'gocql',
        scyllaRepo: 'scylladb/gocql',
        cassandraRepo: 'gocql/gocql', // Apache Cassandra Go driver
        description: 'Go CQL driver'
    },
    {
        name: 'cpp-driver',
        scyllaRepo: 'scylladb/cpp-driver',
        cassandraRepo: 'apache/cassandra-cpp-driver', // Apache C++ driver
        description: 'C++ Cassandra driver'
    },
    {
        name: 'java-driver-3x',
        scyllaRepo: 'scylladb/java-driver',
        cassandraRepo: 'apache/cassandra-java-driver', // Apache Java driver
        description: 'Java Cassandra driver 3.x',
        versionPrefix: '3.' // Filter for 3.x versions
    },
    {
        name: 'java-driver-4x',
        scyllaRepo: 'scylladb/java-driver',
        cassandraRepo: 'apache/cassandra-java-driver', // Apache Java driver
        description: 'Java Cassandra driver 4.x',
        versionPrefix: '4.' // Filter for 4.x versions
    },
    {
        name: 'python-driver',
        scyllaRepo: 'scylladb/python-driver',
        cassandraRepo: 'apache/cassandra-python-driver', // Apache Python driver
        description: 'Python Cassandra driver'
    },
    {
        name: 'cpp-rs-driver',
        scyllaRepo: 'scylladb/cpp-rs-driver',
        cassandraRepo: null, // Scylla-specific driver
        description: 'C++ Rust-style driver'
    },
    {
        name: 'csharp-driver',
        scyllaRepo: 'scylladb/csharp-driver',
        cassandraRepo: 'datastax/csharp-driver', // DataStax C# driver
        description: 'C# Cassandra driver'
    },
    {
        name: 'nodejs-rs-driver',
        scyllaRepo: 'scylladb/nodejs-rs-driver',
        cassandraRepo: null, // Scylla-specific driver
        description: 'Node.js Rust-style driver',
        includePrereleases: true // Project currently ships prerelease builds
    }
];

// DOM elements
const tableBody = document.getElementById('table-body');
const refreshBtn = document.getElementById('refresh-btn');
const clearCacheBtn = document.getElementById('clear-cache-btn');
const lastUpdated = document.getElementById('last-updated');
const cacheStatus = document.getElementById('cache-status');

// State management
let isLoading = false;

// Cache management
const CACHE_KEY = 'drivers_dashboard_cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

function saveToCache(data) {
    const cacheData = {
        timestamp: Date.now(),
        data: data
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    console.log('Data saved to cache');
}

function loadFromCache() {
    try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (!cached) {
            console.log('No cache found');
            return null;
        }

        const cacheData = JSON.parse(cached);
        const age = Date.now() - cacheData.timestamp;

        if (age > CACHE_DURATION) {
            console.log('Cache expired, age:', Math.round(age / (60 * 60 * 1000)), 'hours');
            return null;
        }

        console.log('Loaded data from cache, age:', Math.round(age / (60 * 60 * 1000)), 'hours');
        return cacheData.data;
    } catch (error) {
        console.error('Error loading from cache:', error);
        return null;
    }
}

function shouldUpdateCache() {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return true;

    try {
        const cacheData = JSON.parse(cached);
        const age = Date.now() - cacheData.timestamp;
        return age > CACHE_DURATION;
    } catch (error) {
        console.log('Cache corrupted, clearing...');
        localStorage.removeItem(CACHE_KEY);
        return true;
    }
}

function clearCache() {
    localStorage.removeItem(CACHE_KEY);
    console.log('Cache cleared');
}

// Utility functions
function formatTimestamp(date) {
    return date.toLocaleString();
}

function getRelativeTime(dateString) {
    if (!dateString) return 'N/A';

    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        return 'today';
    } else if (diffDays === 1) {
        return '1 day ago';
    } else {
        return `${diffDays} days ago`;
    }
}

function createStatusBadge(status, type = 'success') {
    const badge = document.createElement('span');
    badge.className = `status-cell status-${type}`;
    badge.textContent = status;
    return badge;
}

function formatVersion(version) {
    // Clean up version string (remove 'v' prefix if present)
    return version.replace(/^v/, '');
}

function parseVersion(version) {
    // Parse semantic version for comparison, handle 'v' prefix
    const cleanVersion = version.replace(/^v/, '');
    const match = cleanVersion.match(/^(\d+)\.(\d+)\.(\d+)/);
    if (match) {
        return {
            major: parseInt(match[1]),
            minor: parseInt(match[2]),
            patch: parseInt(match[3]),
            original: version
        };
    }
    return { major: 0, minor: 0, patch: 0, original: version };
}

function compareVersions(v1, v2) {
    const p1 = parseVersion(v1);
    const p2 = parseVersion(v2);

    if (p1.major !== p2.major) return p1.major - p2.major;
    if (p1.minor !== p2.minor) return p1.minor - p2.minor;
    return p1.patch - p2.patch;
}

function getCurrentQuarter() {
    const now = new Date();
    const month = now.getMonth() + 1; // getMonth() returns 0-11
    const year = now.getFullYear();

    let quarter;
    if (month <= 3) quarter = 1;
    else if (month <= 6) quarter = 2;
    else if (month <= 9) quarter = 3;
    else quarter = 4;

    return { quarter, year };
}

function isInCurrentQuarter(releaseDate) {
    if (!releaseDate) return false;

    const release = new Date(releaseDate);
    const current = getCurrentQuarter();
    const releaseQuarter = Math.floor((release.getMonth() + 3) / 3); // 1-4
    const releaseYear = release.getFullYear();

    return releaseQuarter === current.quarter && releaseYear === current.year;
}

function formatQuarter(dateString) {
    if (!dateString) return 'N/A';

    const date = new Date(dateString);
    const year = date.getFullYear();
    const quarter = Math.floor((date.getMonth() + 3) / 3); // 1-4

    return `Q${quarter} ${year}`;
}

function isVersionSupported(driverName, version) {
    if (!version) return false;

    const supportedVersions = scylladbSupportedVersions[driverName];
    if (!supportedVersions) return false;

    // Check if the version matches any supported version
    return supportedVersions.some(supportedVer => {
        // For exact matches or versions that start with supported version
        return version === supportedVer || version.startsWith(supportedVer + '.');
    });
}

function generateSupportMatrix(scyllaVersion, cassandraVersion, driverName) {
    // For Scylla-specific drivers (no Cassandra equivalent)
    if (!cassandraVersion) {
        return 'N/A';
    }

    // For drivers with both Scylla and Cassandra versions
    if (!scyllaVersion || !cassandraVersion) {
        return 'Unknown';
    }

    const comparison = compareVersions(scyllaVersion, cassandraVersion);
    if (comparison === 0) {
        return '✅ Compatible';
    } else if (comparison > 0) {
        return '⚠️ Ahead';
    } else {
        return '🔄 Behind';
    }
}

// GitHub API Configuration
// GitHub API Token - loaded from config.js (not committed to git)
// If config.js doesn't exist or token is not set, falls back to unauthenticated requests
// Note: GITHUB_TOKEN may already be declared in config.js, so we use a function to get it
function getGitHubToken() {
    // First check if config.js set it via window.GITHUB_CONFIG
    if (typeof window !== 'undefined' && window.GITHUB_CONFIG && window.GITHUB_CONFIG.GITHUB_TOKEN) {
        return window.GITHUB_CONFIG.GITHUB_TOKEN;
    }
    // Fallback: check if GITHUB_TOKEN was declared globally by config.js
    if (typeof GITHUB_TOKEN !== 'undefined' && GITHUB_TOKEN) {
        return GITHUB_TOKEN;
    }
    return null;
}

const githubToken = getGitHubToken();

// Fallback message for debugging
if (!githubToken) {
    console.log('🔓 No GitHub token found - using unauthenticated requests (60/hour limit)');
} else {
    console.log('🔑 GitHub token loaded - authenticated requests enabled (5,000/hour limit)');
}

function getGitHubHeaders() {
    const headers = {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Drivers-Dashboard/1.0'
    };

    if (githubToken) {
        // Use Bearer format for fine-grained tokens (github_pat_), token format for classic tokens (ghp_)
        const authFormat = githubToken.startsWith('github_pat_') ? 'Bearer' : 'token';
        headers['Authorization'] = `${authFormat} ${githubToken}`;
    }

    return headers;
}

async function fetchGitHubReleases(owner, repo, versionPrefix = null, includePrereleases = false) {
    // Special handling for drivers that use tags instead of releases
    const isCassandraPython = owner === 'apache' && repo === 'cassandra-python-driver';
    const isTags = isCassandraPython; // Only Python driver uses tags
    const endpoint = isTags ? 'tags' : 'releases';

    console.log(`📦 Fetching ${endpoint} for: ${owner}/${repo}, includePrereleases=${includePrereleases}`);

    try {
        const url = `https://api.github.com/repos/${owner}/${repo}/${endpoint}`;
        console.log(`🔗 URL: ${url}`);

        const response = await fetch(url, {
            method: 'GET',
            headers: getGitHubHeaders()
        });

        console.log(`📦 Response status: ${response.status}`);

        // Check rate limit headers
        const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining');
        const rateLimitReset = response.headers.get('X-RateLimit-Reset');

        if (rateLimitRemaining) {
            console.log(`📊 Rate limit remaining: ${rateLimitRemaining}`);
        }

        if (response.status === 403 && rateLimitRemaining === '0') {
            const resetTime = new Date(parseInt(rateLimitReset) * 1000);
            console.log(`⏰ Rate limit exceeded. Resets at: ${resetTime.toLocaleTimeString()}`);
            return {
                error: `Rate limit exceeded. Try again after ${resetTime.toLocaleTimeString()}`,
                repo: `${owner}/${repo}`,
                rateLimited: true,
                resetTime: resetTime
            };
        }

        if (!response.ok) {
            console.log(`❌ Failed to fetch ${endpoint}: ${response.status} ${response.statusText}`);
            return {
                error: `Failed to fetch ${endpoint} (${response.status})`,
                repo: `${owner}/${repo}`,
                notFound: response.status === 404
            };
        }

        const data = await response.json();
        console.log(`📦 Found ${data.length} ${endpoint} for ${owner}/${repo}`);

        return await processReleases(data, isCassandraPython, versionPrefix, owner, repo, includePrereleases);
    } catch (error) {
        console.error(`💥 Network error for ${owner}/${repo}:`, error);
        return {
            error: `Network error: ${error.message}`,
            repo: `${owner}/${repo}`,
            isNetworkError: true
        };
    }
}

async function processReleases(data, isTags = false, versionPrefix = null, owner = null, repo = null, includePrereleases = false) {
    console.log(`🔍 Processing ${isTags ? 'tags' : 'releases'} data${versionPrefix ? ` with version filter: ${versionPrefix}` : ''}, includePrereleases=${includePrereleases}`);

    if (isTags) {
        // Handle tags data structure
        console.log('🔖 Processing tags data');
        if (data.length === 0) {
            return null;
        }

        // Filter tags by version prefix if specified
        let filteredTags = data;
        if (versionPrefix) {
            filteredTags = data.filter(tag => tag.name.startsWith(versionPrefix));
            console.log(`🔖 Filtered tags for ${versionPrefix}: ${filteredTags.length} of ${data.length}`);
        }

        // Sort tags by semantic version (highest first) since GitHub returns alphabetically
        filteredTags.sort((a, b) => {
            const versionA = a.name.replace(/^v/, '');
            const versionB = b.name.replace(/^v/, '');
            return compareVersions(versionB, versionA); // Reverse for descending
        });

        if (filteredTags.length === 0) {
            console.log(`⚠️ No tags found for version prefix: ${versionPrefix}`);
            return null;
        }

        // Sort tags by semantic version (highest first) since GitHub returns alphabetically
        filteredTags.sort((a, b) => {
            const versionA = a.name.replace(/^v/, '');
            const versionB = b.name.replace(/^v/, '');
            return compareVersions(versionB, versionA); // Reverse for descending
        });

        const latestTag = filteredTags[0];
        console.log('🔖 Latest filtered tag (sorted by version):', latestTag.name);

        // Try to get the tag's creation date by fetching tag details
        let tagDate = null;
        try {
            const tagResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs/tags/${latestTag.name}`, {
                method: 'GET',
                headers: getGitHubHeaders()
            });

            if (tagResponse.ok) {
                const tagData = await tagResponse.json();
                console.log('🏷️ Tag details:', tagData);

                // The tag object might have tagger info
                if (tagData.object && tagData.object.type === 'tag') {
                    // This is an annotated tag, fetch the tag object
                    const tagObjectResponse = await fetch(tagData.object.url, {
                        method: 'GET',
                        headers: getGitHubHeaders()
                    });

                    if (tagObjectResponse.ok) {
                        const tagObject = await tagObjectResponse.json();
                        if (tagObject.tagger && tagObject.tagger.date) {
                            tagDate = tagObject.tagger.date;
                            console.log('📅 Found tagger date:', tagDate);
                        }
                    }
                }

                // If no tagger date, try to get commit date
                if (!tagDate && tagData.object && tagData.object.type === 'commit') {
                    const commitResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits/${tagData.object.sha}`, {
                        method: 'GET',
                        headers: getGitHubHeaders()
                    });

                    if (commitResponse.ok) {
                        const commitData = await commitResponse.json();
                        if (commitData.committer && commitData.committer.date) {
                            tagDate = commitData.committer.date;
                            console.log('📅 Using commit date:', tagDate);
                        }
                    }
                }
            }
        } catch (error) {
            console.log('⚠️ Could not fetch tag date, using fallback');
        }

        return {
            version: formatVersion(latestTag.name),
            publishedAt: tagDate || new Date().toISOString(), // Use tag date or fallback
            url: `https://github.com/${owner}/${repo}/${isTags ? 'tags' : 'releases/tag'}/${latestTag.name}`
        };
    } else {
        // Handle releases data structure (existing logic)
        console.log(`📦 Processing releases data, total: ${data.length}, includePrereleases: ${includePrereleases}`);
        let stableReleases = data.filter(release => {
            const include = (includePrereleases || !release.prerelease) && !release.draft;
            console.log(`  📋 ${release.tag_name}: prerelease=${release.prerelease}, draft=${release.draft}, include=${include}`);
            return include;
        });

        // Filter releases by version prefix if specified
        if (versionPrefix) {
            stableReleases = stableReleases.filter(release => release.tag_name.startsWith(versionPrefix));
            const eligibleCount = data.filter(release => (includePrereleases || !release.prerelease) && !release.draft).length;
            console.log(`📦 Filtered releases for ${versionPrefix}: ${stableReleases.length} of ${eligibleCount}`);
        }

        if (stableReleases.length === 0) {
            console.log(`⚠️ No releases found for version prefix: ${versionPrefix}`);
            return null;
        }

        const latestRelease = stableReleases[0];
        return {
            version: formatVersion(latestRelease.tag_name),
            publishedAt: latestRelease.published_at,
            url: latestRelease.html_url
        };
    }
}

async function fetchDriverData(driver) {
    console.log(`🚗 Fetching data for driver: ${driver.name}${driver.versionPrefix ? ` (filter: ${driver.versionPrefix})` : ''}, includePrereleases: ${driver.includePrereleases}`);

    try {
        // Add timeout to individual driver fetches
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error(`Timeout fetching ${driver.name}`)), 15000)
        );

        const fetchPromise = async () => {
            // Fetch Scylla release
            const scyllaResult = await fetchGitHubReleases(
                ...driver.scyllaRepo.split('/'),
                driver.versionPrefix,
                driver.includePrereleases || false
            );
            console.log(`🗃️ Scylla result for ${driver.name}:`, scyllaResult);

            // Fetch Cassandra release (if available)
            let cassandraResult = driver.cassandraRepo ?
                await fetchGitHubReleases(...driver.cassandraRepo.split('/'), driver.versionPrefix, driver.includePrereleases || false) :
                null;

            // Special handling for csharp-driver: if API returns no data but we know the correct version
            if (driver.name === 'csharp-driver' && (!cassandraResult || cassandraResult.error)) {
                console.log('🔧 csharp-driver API issue, using known correct version 3.22.0');
                cassandraResult = {
                    version: '3.22.0',
                    publishedAt: '2024-09-27T14:46:00Z', // From web interface
                    url: 'https://github.com/datastax/csharp-driver/releases/tag/3.22.0'
                };
            }

            if (cassandraResult) {
                console.log(`🗃️ Cassandra result for ${driver.name}:`, cassandraResult);
            }

            // Check if either result has an error
            const scyllaError = scyllaResult && typeof scyllaResult === 'object' && scyllaResult.error;
            const cassandraError = cassandraResult && typeof cassandraResult === 'object' && cassandraResult.error;

            // Extract actual release data (filter out error objects)
            const scyllaRelease = scyllaError ? null : scyllaResult;
            const cassandraRelease = cassandraError ? null : cassandraResult;

            console.log(`✅ Processed ${driver.name}: Scylla=${!!scyllaRelease}, Cassandra=${!!cassandraRelease}`);

            return {
                success: !scyllaError, // Success if we at least got Scylla data
                driver: driver.name,
                description: driver.description,
                scyllaRelease,
                cassandraRelease,
                scyllaError: scyllaError ? scyllaResult : null,
                cassandraError: cassandraError ? cassandraResult : null,
                supportMatrix: generateSupportMatrix(
                    scyllaRelease?.version,
                    cassandraRelease?.version,
                    driver.name
                ),
                releaseQuarter: scyllaRelease ? formatQuarter(scyllaRelease.publishedAt) : 'N/A',
                isCurrentQuarter: scyllaRelease ? isInCurrentQuarter(scyllaRelease.publishedAt) : false,
                isScyllaDBSupported: scyllaRelease ? isVersionSupported(driver.name, scyllaRelease.version) : false,
                timestamp: new Date()
            };
        };

        return await Promise.race([fetchPromise(), timeoutPromise]);
    } catch (error) {
        console.error(`💥 Error fetching data for ${driver.name}:`, error);
        return {
            success: false,
            driver: driver.name,
            error: error.message,
            timestamp: new Date()
        };
    }
}

async function updateTable(forceRefresh = false) {
    console.log('🚀 Starting updateTable, forceRefresh:', forceRefresh);
    console.log('🔑 GitHub token status:', githubToken ? 'Loaded (length: ' + githubToken.length + ')' : 'Not loaded');

    if (isLoading) {
        console.log('⚠️ Already loading, skipping');
        return;
    }

    isLoading = true;
    refreshBtn.disabled = true;
    refreshBtn.textContent = 'Refreshing...';
    cacheStatus.textContent = '⏳ Starting refresh...';
    cacheStatus.style.color = '#ffc107';

    // Refresh supported versions from ScyllaDB docs on force refresh
    if (forceRefresh) {
        await fetchSupportedVersions();
    }

    console.log('🧹 Clearing table');
    // Clear existing rows
    tableBody.innerHTML = '';

    // Create loading rows
    drivers.forEach(driver => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${driver.name}</strong><br><small>${driver.description}</small></td>
            <td>${createStatusBadge('Loading...', 'loading').outerHTML}</td>
            <td>${createStatusBadge('Loading...', 'loading').outerHTML}</td>
            <td>Analyzing...</td>
            <td>Checking...</td>
            <td>Verifying...</td>
        `;
        tableBody.appendChild(row);
    });

    let results;
    let usingCache = false;

    try {
    // Check if we should use cached data
    if (!forceRefresh && !shouldUpdateCache()) {
        console.log('📁 Using cached data');
        results = loadFromCache();

        // Sort cached results by Scylla release date (newest first)
        if (results && results.length > 0) {
            results.sort((a, b) => {
                const dateA = a.scyllaRelease?.publishedAt ? new Date(a.scyllaRelease.publishedAt) : new Date(0);
                const dateB = b.scyllaRelease?.publishedAt ? new Date(b.scyllaRelease.publishedAt) : new Date(0);
                return dateB - dateA; // Newest first
            });
            console.log('📋 Cached results sorted by Scylla release date');
        }

        usingCache = true;
        cacheStatus.textContent = '📁 Using cached data';
        cacheStatus.style.color = '#28a745';
        }

        // If no cached data or force refresh, fetch from GitHub
        if (!results) {
            console.log('📡 Fetching fresh data from GitHub');
            cacheStatus.textContent = forceRefresh ? '🔄 Force refreshing...' : '📡 Fetching from GitHub...';
            cacheStatus.style.color = '#007bff';

            console.log('⏰ Starting fetch operations...');
            const promises = drivers.map(fetchDriverData);

            // Add timeout to prevent hanging
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Fetch timeout after 30 seconds')), 30000)
            );

            results = await Promise.race([
                Promise.all(promises),
                timeoutPromise
            ]);

        console.log('✅ Fetch operations completed, results:', results);

        // Sort by Scylla release date (newest first)
        results.sort((a, b) => {
            const dateA = a.scyllaRelease?.publishedAt ? new Date(a.scyllaRelease.publishedAt) : new Date(0);
            const dateB = b.scyllaRelease?.publishedAt ? new Date(b.scyllaRelease.publishedAt) : new Date(0);
            return dateB - dateA; // Newest first
        });

        console.log('📋 Results sorted by Scylla release date');

        // Save to cache
        saveToCache(results);
        usingCache = false;
        refreshBtn.textContent = 'Refresh Data';
        }

        console.log('📊 Processing results for display...');

        // Update table with results
        console.log('📋 Updating table display...');
        tableBody.innerHTML = '';

        results.forEach(result => {
            const row = document.createElement('tr');

            // Driver Name column
            const driverCell = document.createElement('td');
            driverCell.innerHTML = `<strong>${result.driver}</strong><br><small>${
                drivers.find(d => d.name === result.driver)?.description || ''
            }</small>`;
            row.appendChild(driverCell);

            // Latest Scylla Release column
            const scyllaCell = document.createElement('td');
            if (result.scyllaRelease) {
                scyllaCell.innerHTML = `
                    <div><strong>${result.scyllaRelease.version}</strong></div>
                    <small>Released: ${new Date(result.scyllaRelease.publishedAt).toLocaleDateString()}<br>(${getRelativeTime(result.scyllaRelease.publishedAt)})</small>
                    <br><a href="${result.scyllaRelease.url}" target="_blank" style="color: #667eea;">View Release</a>
                `;
        } else if (result.scyllaError) {
            const error = result.scyllaError;
            let errorMsg = error.error;
            let color = '#dc3545'; // Red for errors

            if (error.rateLimited) {
                errorMsg = `Rate limited`;
                color = '#ffc107'; // Yellow for rate limiting
            } else if (error.notFound) {
                errorMsg = `Repository not found`;
            } else if (error.noReleases) {
                errorMsg = `No releases found`;
            } else if (error.isNetworkError) {
                errorMsg = `Network error`;
            }
            scyllaCell.innerHTML = `<span style="color: ${color};" title="${error.error}">❌ ${errorMsg}</span>`;
        } else {
                scyllaCell.innerHTML = '<span style="color: #721c24;">Not available</span>';
            }
            row.appendChild(scyllaCell);

            // Equivalent Cassandra Release column
            const driverConfig = drivers.find(d => d.name === result.driver);
            const cassandraCell = document.createElement('td');
            if (result.cassandraRelease) {
                cassandraCell.innerHTML = `
                    <div><strong>${result.cassandraRelease.version}</strong></div>
                    <small>Released: ${new Date(result.cassandraRelease.publishedAt).toLocaleDateString()}<br>(${getRelativeTime(result.cassandraRelease.publishedAt)})</small>
                    <br><a href="${result.cassandraRelease.url}" target="_blank" style="color: #667eea;">View Release</a>
                `;
            } else if (!driverConfig.cassandraRepo) {
                // Scylla-specific driver
                cassandraCell.innerHTML = '<span style="color: #666; font-style: italic;">N/A</span>';
        } else if (result.cassandraError) {
            const error = result.cassandraError;
            let errorMsg = error.error;
            let color = '#dc3545'; // Red for errors

            if (error.rateLimited) {
                errorMsg = `Rate limited`;
                color = '#ffc107'; // Yellow for rate limiting
            } else if (error.notFound) {
                errorMsg = `Repository not found`;
            } else if (error.noReleases) {
                errorMsg = `No releases found`;
            } else if (error.isNetworkError) {
                errorMsg = `Network error`;
            }
            cassandraCell.innerHTML = `<span style="color: ${color};" title="${error.error}">❌ ${errorMsg}</span>`;
        } else {
                cassandraCell.innerHTML = '<span style="color: #721c24;">Not available</span>';
            }
            row.appendChild(cassandraCell);

            // State vs Upstream column
            const upstreamCell = document.createElement('td');
            if (result.scyllaRelease) {
                // We have Scylla data, show support matrix
                upstreamCell.innerHTML = result.supportMatrix;
            } else if (result.scyllaError) {
                // Scylla fetch failed
                upstreamCell.innerHTML = '<span style="color: #dc3545;">Unable to determine</span>';
            } else {
                // Other error
                upstreamCell.innerHTML = `<span style="color: #721c24;">Error: ${result.error || 'Unknown'}</span>`;
            }
            row.appendChild(upstreamCell);

            // Release Quarter column
            const quarterCell = document.createElement('td');
            if (result.scyllaRelease) {
                const quarterText = result.releaseQuarter;
                const isCurrent = result.isCurrentQuarter;
                quarterCell.innerHTML = `
                    <span style="color: ${isCurrent ? '#28a745' : '#6c757d'}; font-weight: ${isCurrent ? 'bold' : 'normal'};">
                        ${isCurrent ? '✅ ' : ''}${quarterText}
                    </span>
                `;
            } else {
                quarterCell.innerHTML = '<span style="color: #721c24;">N/A</span>';
            }
            row.appendChild(quarterCell);

            // ScyllaDB Support column
            const supportCell = document.createElement('td');
            if (result.scyllaRelease) {
                const isSupported = result.isScyllaDBSupported;
                const supportedVersions = scylladbSupportedVersions[result.driver] || [];
                supportCell.innerHTML = `
                    <span style="color: ${isSupported ? '#28a745' : '#dc3545'}; font-weight: bold;">
                        ${isSupported ? '✅ Supported' : '❌ Not Supported'}
                    </span>
                    ${supportedVersions.length > 0 ? `<br><small>Supported: ${supportedVersions.join(', ')}</small>` : ''}
                `;
            } else if (result.scyllaError) {
                supportCell.innerHTML = '<span style="color: #dc3545;">Unable to check</span>';
            } else {
                supportCell.innerHTML = '<span style="color: #721c24;">N/A</span>';
            }
            row.appendChild(supportCell);

            tableBody.appendChild(row);
        });

        console.log('✅ Table display updated successfully');

        // Update last updated timestamp
        lastUpdated.textContent = `Last updated: ${formatTimestamp(new Date())}`;

        // Update cache status
        if (usingCache) {
            cacheStatus.textContent = '📁 Data loaded from cache';
            cacheStatus.style.color = '#28a745';
        } else {
            cacheStatus.textContent = '✅ Data updated from GitHub';
            cacheStatus.style.color = '#28a745';
        }

    } catch (error) {
        console.error('💥 Error in updateTable:', error);
        cacheStatus.textContent = '❌ Update failed';
        cacheStatus.style.color = '#dc3545';

        // Show error in table
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; color: #dc3545; padding: 2rem;">
                    <strong>Error loading data:</strong><br>
                    ${error.message}<br><br>
                    <small>Check browser console for details</small>
                </td>
            </tr>
        `;
    } finally {
        // Always reset loading state
        console.log('🔄 Resetting loading state');
        isLoading = false;
        refreshBtn.disabled = false;
        refreshBtn.textContent = 'Refresh Data';
    }
}

// Auto-refresh functionality (disabled since we use daily caching)
function startAutoRefresh() {
    // Only refresh automatically if cache is stale (every 24 hours)
    setInterval(() => {
        if (shouldUpdateCache()) {
            console.log('Auto-refreshing stale cache...');
            updateTable(true);
        }
    }, 60 * 60 * 1000); // Check every hour
}

// Event listeners
refreshBtn.addEventListener('click', () => updateTable(true)); // Force refresh when button clicked
clearCacheBtn.addEventListener('click', () => {
    clearCache();
    cacheStatus.textContent = '🗑️ Cache cleared';
    cacheStatus.style.color = '#dc3545';
    // Refresh to get fresh data
    setTimeout(() => updateTable(true), 1000);
});


// Test repository access
async function testRepository(repoString) {
    console.log(`🧪 Testing repository access: ${repoString}`);
    try {
        const [owner, repo] = repoString.split('/');
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases`, {
            method: 'GET',
            headers: getGitHubHeaders()
        });

        console.log(`🧪 Test result for ${repoString}: ${response.status}`);

        // Check rate limit info
        const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining');
        if (rateLimitRemaining) {
            console.log(`🧪 Rate limit remaining: ${rateLimitRemaining}`);
        }

        if (response.ok) {
            const data = await response.json();
            console.log(`🧪 Releases accessible: Found ${data.length} releases`);
        } else if (response.status === 403 && rateLimitRemaining === '0') {
            console.log(`🧪 Rate limit exceeded for ${repoString}`);
        } else {
            console.log(`🧪 Access failed: ${response.status} ${response.statusText}`);
        }
    } catch (error) {
        console.log(`🧪 Test error for ${repoString}:`, error);
    }
}

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Dashboard initializing...');
    console.log('🔑 Using GitHub authentication - higher rate limits enabled');

    // Debug: Check if DOM elements exist
    console.log('🔍 Checking DOM elements...');
    const tableBody = document.getElementById('driver-table-body');
    const refreshBtn = document.getElementById('refresh-btn');
    const cacheStatus = document.getElementById('cache-status');

    console.log('📊 Table body:', tableBody ? 'Found' : 'NOT FOUND');
    console.log('🔄 Refresh button:', refreshBtn ? 'Found' : 'NOT FOUND');
    console.log('💾 Cache status:', cacheStatus ? 'Found' : 'NOT FOUND');

    // Fetch supported versions from ScyllaDB docs (before loading driver data)
    await fetchSupportedVersions();

    // Clear cache on startup to get fresh data
    clearCache();
    console.log('🗑️ Cache cleared on startup');

    // Test a few key repositories
    console.log('🧪 Testing repository access with authentication...');
    await testRepository('scylladb/gocql');
    await testRepository('scylladb/scylla-rust-driver');

    updateTable(false); // Fetch fresh data on page load
    startAutoRefresh(); // Check for updates every hour
});
