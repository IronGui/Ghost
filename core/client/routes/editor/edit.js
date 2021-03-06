import AuthenticatedRoute from 'ghost/routes/authenticated';
import base from 'ghost/mixins/editor-base-route';
import isNumber from 'ghost/utils/isNumber';
import isFinite from 'ghost/utils/isFinite';

var EditorEditRoute = AuthenticatedRoute.extend(base, {
    model: function (params) {
        var self = this,
            post,
            postId,
            paginationSettings;

        postId = Number(params.post_id);

        if (!isNumber(postId) || !isFinite(postId) || postId % 1 !== 0 || postId <= 0) {
            return this.transitionTo('error404', 'editor/' + params.post_id);
        }

        post = this.store.getById('post', postId);

        paginationSettings = {
            id: postId,
            status: 'all',
            staticPages: 'all'
        };

        return this.store.find('user', 'me').then(function (user) {
            if (user.get('isAuthor')) {
                paginationSettings.author = user.get('slug');
            }

            return self.store.find('post', paginationSettings).then(function (records) {
                var post = records.get('firstObject');

                if (user.get('isAuthor') && !post.isAuthoredByUser(user)) {
                    // do not show the post if they are an author but not this posts author
                    post = null;
                }

                if (post) {
                    return post;
                }

                return self.transitionTo('posts.index');
            });
        });
    }
});

export default EditorEditRoute;
